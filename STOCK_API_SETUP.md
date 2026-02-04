# Stock API Setup Instructions

## Get Your Free Alpha Vantage API Key

1. Go to: https://www.alphavantage.co/support/#api-key
2. Enter your email address
3. You'll receive your API key instantly (takes less than 20 seconds)

## Configure Your API Key

1. Create a `.env` file in the project root:
   ```bash
   cp .env.example .env
   ```

2. Open the `.env` file and replace `your_api_key_here` with your actual API key:
   ```
   ALPHA_VANTAGE_API_KEY=YOUR_ACTUAL_KEY_HERE
   PORT=3001
   ```

3. Save the file

## Restart the Server

```bash
# Stop the current server (Ctrl+C in the terminal where it's running)
# Then restart it:
npm run mcp
```

## Test It

1. Open your website at http://localhost:8000
2. You should see real ServiceNow (NOW) stock data
3. The timestamp will show when the data was last updated

## Security Notes

- The `.env` file is already in `.gitignore` - it won't be committed to version control
- Never share your API key publicly
- The free tier allows 25 API calls per day, which is plenty for this dashboard

## Troubleshooting

If you still see demo data:
1. Check the browser console (F12) for error messages
2. Verify the server is running on port 3001
3. Make sure your `.env` file is in the project root (same directory as `package.json`)
4. Restart the server after creating the `.env` file
