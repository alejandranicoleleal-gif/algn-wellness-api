export default function handler(req, res) {
  res.writeHead(200, {"Content-Type": "text/html"});
  res.end(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>ALGN Women's Hormone Assessment</title>
  <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <style>* { margin: 0; padding: 0; box-sizing: border-box; } body { background: #0A0A0A; }</style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    ${await import('../public/app.jsx')}
  </script>
</body>
</html>`);
}
