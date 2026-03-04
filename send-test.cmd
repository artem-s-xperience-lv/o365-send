@echo off
curl -X POST http://localhost:3000/api/send ^
  -H "Content-Type: application/json" ^
  -d "{\"to\":\"recipient@example.com\",\"subject\":\"Test from CMD\",\"body\":\"Hello from command line\"}"