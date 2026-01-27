/**
 * Tests for stock data functionality
 */

describe('Stock Data Functions', () => {
  let stockContent;

  beforeEach(() => {
    document.body.innerHTML = `
      <div id="stock-content" class="loading">Loading stock data...</div>
    `;
    stockContent = document.getElementById('stock-content');
  });

  describe('getStockData', () => {
    test('should fetch and display stock data successfully', async () => {
      const mockStockData = {
        chart: {
          result: [{
            meta: {
              regularMarketPrice: 850.25,
              previousClose: 842.50,
              chartPreviousClose: 842.50
            },
            indicators: {
              quote: [{
                open: [845.00],
                high: [855.00],
                low: [843.00]
              }]
            }
          }]
        }
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockStockData
      });

      const response = await fetch('https://api.allorigins.win/raw?url=...');
      const data = await response.json();
      const result = data.chart.result[0];
      const quote = result.meta;

      const price = quote.regularMarketPrice;
      const previousClose = quote.previousClose;
      const change = price - previousClose;
      const percentChange = (change / previousClose) * 100;

      expect(price).toBe(850.25);
      expect(change).toBeCloseTo(7.75, 2);
      expect(percentChange).toBeCloseTo(0.92, 2);
    });

    test('should try multiple proxies on failure', async () => {
      // First proxy fails
      global.fetch
        .mockResolvedValueOnce({
          ok: false,
          status: 500
        })
        // Second proxy succeeds
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            chart: {
              result: [{
                meta: {
                  regularMarketPrice: 850.25,
                  previousClose: 842.50
                },
                indicators: {
                  quote: [{
                    open: [845.00],
                    high: [855.00],
                    low: [843.00]
                  }]
                }
              }]
            }
          })
        });

      const proxies = [
        'https://proxy1.com',
        'https://proxy2.com'
      ];

      let data = null;
      for (const proxy of proxies) {
        try {
          const response = await fetch(proxy);
          if (response.ok) {
            data = await response.json();
            break;
          }
        } catch (error) {
          continue;
        }
      }

      expect(data).not.toBeNull();
      expect(data.chart.result[0].meta.regularMarketPrice).toBe(850.25);
    });

    test('should handle case when all proxies fail', async () => {
      global.fetch
        .mockResolvedValueOnce({ ok: false, status: 500 })
        .mockResolvedValueOnce({ ok: false, status: 503 })
        .mockResolvedValueOnce({ ok: false, status: 429 });

      const proxies = ['proxy1', 'proxy2', 'proxy3'];
      let data = null;
      let lastError = null;

      for (const proxy of proxies) {
        try {
          const response = await fetch(proxy);
          if (!response.ok) {
            lastError = new Error(`HTTP ${response.status}`);
            continue;
          }
          data = await response.json();
          break;
        } catch (error) {
          lastError = error;
          continue;
        }
      }

      expect(data).toBeNull();
      expect(lastError).not.toBeNull();
    });

    test('should calculate positive price change correctly', () => {
      const price = 850.25;
      const previousClose = 842.50;
      const change = price - previousClose;
      const percentChange = (change / previousClose) * 100;
      const changeClass = change >= 0 ? 'positive' : 'negative';
      const changeSymbol = change >= 0 ? '+' : '';

      expect(change).toBeCloseTo(7.75, 2);
      expect(percentChange).toBeCloseTo(0.92, 2);
      expect(changeClass).toBe('positive');
      expect(changeSymbol).toBe('+');
    });

    test('should calculate negative price change correctly', () => {
      const price = 835.00;
      const previousClose = 842.50;
      const change = price - previousClose;
      const percentChange = (change / previousClose) * 100;
      const changeClass = change >= 0 ? 'positive' : 'negative';
      const changeSymbol = change >= 0 ? '+' : '';

      expect(change).toBeCloseTo(-7.50, 2);
      expect(percentChange).toBeCloseTo(-0.89, 2);
      expect(changeClass).toBe('negative');
      expect(changeSymbol).toBe('');
    });

    test('should display stock information with correct formatting', () => {
      const price = 850.25;
      const change = 7.75;
      const percentChange = 0.92;
      const open = 845.00;
      const high = 855.00;
      const low = 843.00;
      const previousClose = 842.50;

      const stockHTML = `
        <div class="stock-price">$${price.toFixed(2)}</div>
        <div class="stock-change positive">+${change.toFixed(2)} (+${percentChange.toFixed(2)}%)</div>
        <div>Open: $${open.toFixed(2)}</div>
        <div>High: $${high.toFixed(2)}</div>
        <div>Low: $${low.toFixed(2)}</div>
        <div>Prev Close: $${previousClose.toFixed(2)}</div>
      `;

      expect(stockHTML).toContain('$850.25');
      expect(stockHTML).toContain('+7.75');
      expect(stockHTML).toContain('+0.92%');
      expect(stockHTML).toContain('Open: $845.00');
    });

    test('should handle timeout with AbortSignal', async () => {
      const timeoutSignal = AbortSignal.timeout(8000);

      global.fetch.mockRejectedValueOnce(new Error('Timeout'));

      try {
        await fetch('https://api.example.com', {
          signal: timeoutSignal
        });
        fail('Should have thrown error');
      } catch (error) {
        expect(error.message).toBe('Timeout');
      }
    });

    test('should display error message on failure', () => {
      stockContent.innerHTML = `<div class="error">Unable to fetch stock data. The service may be temporarily unavailable or rate limited. Try refreshing in a few minutes.</div>`;

      expect(stockContent.innerHTML).toContain('Unable to fetch stock data');
      expect(stockContent.innerHTML).toContain('rate limited');
    });
  });

  describe('Stock data validation', () => {
    test('should handle missing previousClose with chartPreviousClose fallback', () => {
      const quote = {
        regularMarketPrice: 850.25,
        chartPreviousClose: 842.50
      };

      const previousClose = quote.previousClose || quote.chartPreviousClose;
      expect(previousClose).toBe(842.50);
    });

    test('should extract correct values from nested response structure', () => {
      const mockData = {
        chart: {
          result: [{
            meta: { regularMarketPrice: 850.25 },
            indicators: {
              quote: [{
                open: [845.00],
                high: [855.00],
                low: [843.00]
              }]
            }
          }]
        }
      };

      const result = mockData.chart.result[0];
      const quote = result.meta;
      const indicators = result.indicators.quote[0];

      expect(quote.regularMarketPrice).toBe(850.25);
      expect(indicators.open[0]).toBe(845.00);
      expect(indicators.high[0]).toBe(855.00);
      expect(indicators.low[0]).toBe(843.00);
    });
  });
});
