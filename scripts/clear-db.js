const API_URL = 'http://localhost:3000/api';

async function clearDatabase() {
  try {
    const response = await fetch(`${API_URL}/logs`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to clear database');
    }

    const result = await response.json();
    console.log('Database cleared successfully:', result.message);
  } catch (error) {
    console.error('Error clearing database:', error);
  }
}

clearDatabase(); 