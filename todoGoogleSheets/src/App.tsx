/// <reference types="chrome"/>
import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

// Define TodoItem type
interface TodoItem {
  id: number;
  task: string;
  dateCreated: string;
  dateDone: string;
}

function App() {
  const [todos, setTodos] = useState<TodoItem[]>([])
  const [input, setInput] = useState('')
  const [editingTodo, setEditingTodo] = useState<TodoItem | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [spreadsheetId, setSpreadsheetId] = useState<string | null>(null)
  const [sheets, setSheets] = useState<{id: string, name: string}[]>([])
  const [showSheetSelector, setShowSheetSelector] = useState(false)

  // Load saved data from Chrome storage
  useEffect(() => {
    if (chrome.storage && chrome.storage.sync) {
      chrome.storage.sync.get(['spreadsheetId', 'authToken'], (result) => {
        if (result.spreadsheetId) {
          setSpreadsheetId(result.spreadsheetId);
        }

        if (result.authToken) {
          setToken(result.authToken);
          // If we have both token and spreadsheet ID, fetch todos
          if (result.spreadsheetId && result.authToken) {
            fetchTodos(result.authToken);
          } else if (result.authToken) {
            // If we have token but no spreadsheet, show sheet selector
            fetchAvailableSheets(result.authToken);
            setShowSheetSelector(true);
          }
        }
      });
    }
  }, []);

  const saveAuthToken = (token: string) => {
    if (chrome.storage && chrome.storage.sync) {
      chrome.storage.sync.set({ authToken: token });
    }
  };

  const getAuthToken = async () => {
    try {
      // Check if chrome.identity is available
      if (typeof chrome === 'undefined' || !chrome.identity) {
        console.error('Chrome identity API not available');
        setError('Chrome identity API not available. This must run as a Chrome extension.');
        return;
      }

      setLoading(true);
      setError(null);

      console.log('Attempting to get auth token...');
      const token = await new Promise<string>((resolve, reject) => {
        chrome.identity.getAuthToken({ interactive: true }, function(token) {
          console.log('Token result:', token, 'Error:', chrome.runtime.lastError);
          if (chrome.runtime.lastError) {
            const errorMessage = chrome.runtime.lastError.message || 'Unknown error during authentication';
            reject(new Error(errorMessage));
          } else if (token) {
            resolve(token as string);
          } else {
            reject(new Error('No token received'));
          }
        });
      });

      console.log('Token received successfully');
      setToken(token);
      // Save token to Chrome storage for persistence
      saveAuthToken(token);

      // If we have a spreadsheet, fetch todos. Otherwise show sheet selector
      if (spreadsheetId) {
        await fetchTodos(token);
      } else {
        await fetchAvailableSheets(token);
        setShowSheetSelector(true);
      }
    } catch (err: unknown) {
      console.error('Error getting auth token:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown authentication error';
      setError(`Failed to authenticate with Google: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSheets = async (authToken: string) => {
    try {
      setLoading(true);
      console.log('Fetching Google Sheets with token:', authToken.substring(0, 5) + '...');
      const response = await axios.get(
        'https://www.googleapis.com/drive/v3/files', {
          params: {
            q: "mimeType='application/vnd.google-apps.spreadsheet'",
            fields: "files(id, name)"
          },
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      console.log('Google Sheets API response:', response.data);
      setSheets(response.data.files || []);
    } catch (err: unknown) {
      console.error('Error fetching sheets:', err);
      // Get detailed error information
      const error = err as { response?: { data?: { error?: { message?: string } }, status?: number } };
      const errMsg = error.response?.data?.error?.message || (err instanceof Error ? err.message : 'Unknown error');
      console.log('Detailed error:', errMsg);
      setError(`Failed to fetch Google Sheets: ${errMsg}`);

      // If token is invalid, clear it and prompt for re-authentication
      if (error.response?.status === 401) {
        console.log('Token invalid, clearing and requesting new token');
        setToken(null);
        chrome.storage.sync.remove('authToken');
        // Force re-authentication
        setTimeout(() => {
          getAuthToken();
        }, 1000);
      }
    } finally {
      setLoading(false);
    }
  };

  const createNewSheet = async () => {
    try {
      if (!token) return;

      setLoading(true);
      // Create a new Google Sheet with proper columns
      const response = await axios.post(
        'https://sheets.googleapis.com/v4/spreadsheets',
        {
          properties: {
            title: "Todo List"
          },
          sheets: [
            {
              properties: {
                title: "Sheet1"
              }
            }
          ]
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const newSpreadsheetId = response.data.spreadsheetId;

      // Add headers to the new sheet
      await axios.put(
        `https://sheets.googleapis.com/v4/spreadsheets/${newSpreadsheetId}/values/Sheet1!A1:C1`,
        {
          values: [["Task", "Date Created", "Date Done"]]
        },
        {
          params: {
            valueInputOption: 'RAW'
          },
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setSpreadsheetId(newSpreadsheetId);
      saveSpreadsheetId(newSpreadsheetId);
      setShowSheetSelector(false);
      await fetchTodos(token);
    } catch (err: unknown) {
      console.error('Error creating sheet:', err);
      const error = err as { response?: { data?: { error?: { message?: string } } } };
      const errMsg = error.response?.data?.error?.message || (err instanceof Error ? err.message : 'Unknown error');
      setError(`Failed to create new Google Sheet: ${errMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const selectSheet = (id: string) => {
    setSpreadsheetId(id);
    saveSpreadsheetId(id);
    setShowSheetSelector(false);
    if (token) {
      fetchTodos(token);
    }
  };

  const saveSpreadsheetId = (id: string) => {
    if (chrome.storage && chrome.storage.sync) {
      chrome.storage.sync.set({ spreadsheetId: id });
    }
  };

  const fetchTodos = async (authToken: string) => {
    if (!spreadsheetId) return;

    try {
      setLoading(true);
      const response = await axios.get(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A2:C`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      // Get the header row to verify column structure
      const headerResponse = await axios.get(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A1:C1`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      const headers = headerResponse.data.values?.[0] || [];
      console.log('Sheet headers:', headers);

      // If headers don't exist or don't match expected format, create them
      if (headers.length < 3 || headers[0] !== 'Task' || headers[1] !== 'Date Created' || headers[2] !== 'Date Done') {
        console.log('Setting up proper headers');
        await axios.put(
          `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A1:C1`,
          {
            values: [["Task", "Date Created", "Date Done"]]
          },
          {
            params: {
              valueInputOption: 'RAW'
            },
            headers: {
              Authorization: `Bearer ${authToken}`,
              'Content-Type': 'application/json',
            },
          }
        );
      }

      // Process the rows into todos
      const values = response.data.values || [];
      console.log('Retrieved todos from sheet:', values);

      const formattedTodos = values.map((row: string[], index: number) => ({
        id: index + 2, // +2 because row 1 is header and we're 0-indexed
        task: row[0] || '',
        dateCreated: row[1] || '',
        dateDone: row[2] || ''
      })).filter((todo: TodoItem) => todo.task && !todo.dateDone); // Only show tasks that aren't done

      setTodos(formattedTodos);
    } catch (err: unknown) {
      console.error('Error fetching todos:', err);
      const error = err as { response?: { data?: { error?: { message?: string } } } };
      const errMsg = error.response?.data?.error?.message || (err instanceof Error ? err.message : 'Unknown error');
      setError(`Failed to fetch todos: ${errMsg}`);
      // Don't clear token here, as it might just be a new sheet without proper format
    } finally {
      setLoading(false);
    }
  };

  const addTodo = async (text: string) => {
    if (!token || !spreadsheetId) {
      await getAuthToken();
      return;
    }

    try {
      setLoading(true);
      const dateCreated = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

      await axios.post(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A:C:append`,
        {
          values: [[text, dateCreated, ""]]
        },
        {
          params: {
            valueInputOption: 'RAW',
            insertDataOption: 'INSERT_ROWS',
          },
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      await fetchTodos(token);
      setInput('');
    } catch (err: unknown) {
      console.error('Error adding todo:', err);
      const error = err as { response?: { data?: { error?: { message?: string } } } };
      const errMsg = error.response?.data?.error?.message || (err instanceof Error ? err.message : 'Unknown error');
      setError(`Failed to add todo: ${errMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const startEditTodo = (todo: TodoItem) => {
    setEditingTodo(todo);
    setInput(todo.task);
  };

  const updateTodo = async () => {
    if (!editingTodo || !token || !spreadsheetId) return;

    try {
      setLoading(true);

      // Update just the task text in the sheet
      await axios.put(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A${editingTodo.id}`,
        {
          values: [[input]]
        },
        {
          params: {
            valueInputOption: 'RAW'
          },
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      await fetchTodos(token);
      setInput('');
      setEditingTodo(null);
    } catch (err: unknown) {
      console.error('Error updating todo:', err);
      const error = err as { response?: { data?: { error?: { message?: string } } } };
      const errMsg = error.response?.data?.error?.message || (err instanceof Error ? err.message : 'Unknown error');
      setError(`Failed to update todo: ${errMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setEditingTodo(null);
    setInput('');
  };

  const markTodoAsDone = async (todo: TodoItem) => {
    if (!token || !spreadsheetId) {
      await getAuthToken();
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('Marking todo as done, row:', todo.id);
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

      // Update the Date Done column
      await axios.put(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!C${todo.id}`,
        {
          values: [[today]]
        },
        {
          params: {
            valueInputOption: 'RAW'
          },
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Todo marked as done successfully');
      await fetchTodos(token);
    } catch (err: unknown) {
      console.error('Error marking todo as done:', err);
      const error = err as { response?: { data?: { error?: { message?: string } } } };
      const errMsg = error.response?.data?.error?.message || (err instanceof Error ? err.message : 'Unknown error');
      setError(`Failed to mark todo as done: ${errMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const changeSheet = () => {
    setShowSheetSelector(true);
    if (token) {
      fetchAvailableSheets(token);
    }
  };

  return (
    <div>
      <h1>Todo Google Sheets</h1>

      {!token && (
        <button
          onClick={getAuthToken}
          disabled={loading}
          className="auth-button"
        >
          Sign in with Google
        </button>
      )}

      {token && showSheetSelector && (
        <div className="sheet-selector">
          <h2>Select a Google Sheet</h2>
          {sheets.length > 0 ? (
            <div className="sheets-list">
              {sheets.map(sheet => (
                <button
                  key={sheet.id}
                  onClick={() => selectSheet(sheet.id)}
                  className="sheet-button"
                >
                  {sheet.name}
                </button>
              ))}
            </div>
          ) : (
            <p>No spreadsheets found</p>
          )}
          <button
            onClick={createNewSheet}
            disabled={loading}
            className="create-sheet-button"
          >
            Create New Todo Sheet
          </button>
        </div>
      )}

      {token && spreadsheetId && !showSheetSelector && !editingTodo && (
        <div className="todo-input">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && input.trim()) {
                addTodo(input.trim());
              }
            }}
            placeholder="Add a new todo..."
            className="todo-input-field"
          />
          <button
            onClick={() => input.trim() && addTodo(input.trim())}
            disabled={loading || !input.trim()}
            className="add-button"
          >
            Add
          </button>
          <button
            onClick={changeSheet}
            className="change-sheet-button"
          >
            Change Sheet
          </button>
        </div>
      )}

      {token && spreadsheetId && !showSheetSelector && editingTodo && (
        <div className="edit-todo">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && input.trim()) {
                updateTodo();
              }
            }}
            className="todo-input-field"
          />
          <button
            onClick={updateTodo}
            disabled={loading || !input.trim()}
            className="update-button"
          >
            Update
          </button>
          <button
            onClick={cancelEdit}
            className="cancel-button"
          >
            Cancel
          </button>
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)} className="dismiss-button">
            Dismiss
          </button>
        </div>
      )}

      {token && spreadsheetId && !showSheetSelector && (
        <ul className="todo-list">
          {todos.length === 0 ? (
            <li className="empty-list">No todos yet. Add your first one above!</li>
          ) : (
            todos.map((todo: TodoItem) => (
              <li
                key={todo.id}
                className="todo-item"
              >
                <div className="todo-text">{todo.task}</div>
                <div className="todo-date">{todo.dateCreated}</div>
                <div className="todo-actions">
                  <button
                    onClick={() => startEditTodo(todo)}
                    className="edit-button"
                    disabled={loading}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => markTodoAsDone(todo)}
                    className="delete-button"
                    disabled={loading}
                  >
                    Done
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

export default App

