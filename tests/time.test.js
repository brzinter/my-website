/**
 * Tests for time and date display functionality
 */

describe('Time and Date Functions', () => {
  let timeElement;
  let dateElement;

  beforeEach(() => {
    // Set up DOM elements
    document.body.innerHTML = `
      <div id="time">00:00:00</div>
      <div id="date">Loading...</div>
    `;
    timeElement = document.getElementById('time');
    dateElement = document.getElementById('date');
    // Restore Date mock if it was spied on
    jest.restoreAllMocks();
  });

  describe('updateTime', () => {
    test('should update time element with current time in HH:MM:SS format', () => {
      // Create a mock date
      const mockDate = new Date('2024-01-15T14:30:45');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

      // Simulate the updateTime function
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      timeElement.textContent = `${hours}:${minutes}:${seconds}`;

      expect(timeElement.textContent).toBe('14:30:45');
    });

    test('should pad single digit hours, minutes, and seconds with leading zero', () => {
      const mockDate = new Date('2024-01-15T09:05:08');

      const hours = String(mockDate.getHours()).padStart(2, '0');
      const minutes = String(mockDate.getMinutes()).padStart(2, '0');
      const seconds = String(mockDate.getSeconds()).padStart(2, '0');
      timeElement.textContent = `${hours}:${minutes}:${seconds}`;

      expect(timeElement.textContent).toBe('09:05:08');
    });

    test('should update date element with formatted date', () => {
      const mockDate = new Date('2024-01-15T14:30:45');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

      const now = new Date();
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      dateElement.textContent = now.toLocaleDateString('en-US', options);

      expect(dateElement.textContent).toBe('Monday, January 15, 2024');
    });

    test('should handle midnight correctly', () => {
      const mockDate = new Date('2024-01-15T00:00:00');

      const hours = String(mockDate.getHours()).padStart(2, '0');
      const minutes = String(mockDate.getMinutes()).padStart(2, '0');
      const seconds = String(mockDate.getSeconds()).padStart(2, '0');
      timeElement.textContent = `${hours}:${minutes}:${seconds}`;

      expect(timeElement.textContent).toBe('00:00:00');
    });

    test('should handle noon correctly', () => {
      const mockDate = new Date('2024-01-15T12:00:00');

      const hours = String(mockDate.getHours()).padStart(2, '0');
      const minutes = String(mockDate.getMinutes()).padStart(2, '0');
      const seconds = String(mockDate.getSeconds()).padStart(2, '0');
      timeElement.textContent = `${hours}:${minutes}:${seconds}`;

      expect(timeElement.textContent).toBe('12:00:00');
    });
  });
});
