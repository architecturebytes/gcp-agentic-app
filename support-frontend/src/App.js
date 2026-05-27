import React, { useState, useRef, useEffect } from 'react';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [structuredInfo, setStructuredInfo] = useState(null);
  const chatEndRef = useRef(null);
  
  const API_BASE = process.env.REACT_APP_AGENT_PROXY_SERVER_URL;

  useEffect(() => {
    fetch(`${API_BASE}/apps/app/users/user123/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    })
    .then(res => res.json())
    .then(data => setSessionId(data.id))
    .catch(err => console.error("Failed to initialize session", err));
  }, [API_BASE]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !sessionId) return;
    
    const userMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      const response = await fetch(`${API_BASE}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          appName: 'app', 
          userId: 'user123',
          sessionId: sessionId,
          newMessage: { role: 'user', parts: [{ text: input }] }
        }),
      });
      const data = await response.json();
      // console.log("Backend response data:", data);
      
      let agentText = null;
      let newStructuredInfo = null;

      if (Array.isArray(data)) {
        for (const item of data) {
            // console.log("Processing item:", JSON.stringify(item, null, 2));
            if (item.content && item.content.parts) {
                for (const part of item.content.parts) {
                    if (part.text && part.text.trim() !== "") {
                        agentText = part.text;
                    }
                }
            }

            // Explicitly search for function_response inside parts
            let fResponse = null;
            if (item.content && item.content.parts) {
                for (const part of item.content.parts) {
                    if (part.function_response) {
                        fResponse = part.function_response;
                    } else if (part.functionResponse) { // Backward compatibility
                        fResponse = part.functionResponse;
                    }
                }
            }
            // console.log("Detected fResponse:", fResponse);

            if (fResponse) {
                // Ensure result is parsed correctly if it's a string
                const result = typeof fResponse.response.result === 'string' ? JSON.parse(fResponse.response.result) : fResponse.response.result;
                const funcName = fResponse.name;
                // console.log("Parsed result:", result, "Function name:", funcName);

                if (funcName === "get_order" && result && !result.error) {
                    // console.log("Mapping get_order data");
                    newStructuredInfo = {
                        title: "Order Details",
                        type: "list",
                        fields: [
                            { label: "Order ID", value: result.id },
                            { label: "Status", value: result.status },
                            { label: "Product ID", value: result.product_id },
                            { label: "Date", value: result.date }
                        ]
                    };
                } else if (funcName === "get_product" && result && !result.error) {
                    // console.log("Mapping get_product data");
                    newStructuredInfo = {
                        title: "Product Details",
                        type: "list",
                        fields: [
                            { label: "Product", value: result.name },
                            { label: "Price", value: `$${result.price}` },
                            { label: "Stock", value: result.stock }
                        ]
                    };
                } else if (funcName === "get_orders") {
                    // console.log("Mapping get_orders data");
                    newStructuredInfo = {
                        title: "All Orders",
                        type: "table",
                        data: result
                    };
                }
            }
        }
      }
      
      // console.log("Final newStructuredInfo:", newStructuredInfo);
      if (agentText) {
        setMessages(prev => [...prev, { role: 'agent', text: agentText }]);
      }
      if (newStructuredInfo) setStructuredInfo(newStructuredInfo);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'agent', text: 'Error: Could not reach agent.' }]);
    }
  };

  return (
    <div className="main-container">
      <div className="info-panel">
        <h1>Bytes Commerce</h1>
        {structuredInfo ? (
            <div className="info-card">
                <h2>{structuredInfo.title}</h2>
                {structuredInfo.type === 'table' ? (
                    <table className="info-table">
                        <thead>
                            <tr><th>ID</th><th>Status</th><th>Date</th></tr>
                        </thead>
                        <tbody>
                            {structuredInfo.data.map((order, i) => (
                                <tr key={i}><td>{order.id}</td><td>{order.status}</td><td>{order.date}</td></tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="info-details">
                        {structuredInfo.fields.map((field, i) => (
                            <div key={i} className="info-field">
                                <strong>{field.label}:</strong> <span>{field.value}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        ) : (
            <p>Welcome! Ask about an order or product to see details here.</p>
        )}
      </div>
      <div className="App">
        <header className="App-header">
          <h1>Customer Service Agent</h1>
        </header>
        <div className="chat-box">
          {messages.map((msg, i) => (
            <div key={i} className={`message ${msg.role}`}>
              {msg.text}
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
        <div className="input-area">
          <textarea 
            value={input} 
            onChange={e => setInput(e.target.value)} 
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder="Type your message..."
            rows="3"
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default App;
