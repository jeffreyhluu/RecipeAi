'use client'

import Image from "next/image"
import { useState } from 'react'
import { Box, Stack, TextField, Button, Typography } from '@mui/material' // Import Box and Stack from MUI
import React from 'react'
import ReactMarkdown from 'react-markdown'
import { motion } from "framer-motion"


export default function Home() {
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: `Hello! Welcome to RecipeAi, your personal AI chef. 
    I'm here to make your cooking experience easier, more enjoyable, and absolutely delicious. 
    Whether you're looking for a quick weeknight dinner, 
    something special for a weekend, or just inspiration to try something new, I've got you covered!`,
    timestamp: new Date().toLocaleString()
  }]);

  const [message, setMessage] = useState('');

  const sendMessage = async () => {
    setMessage('');
    setMessages((messages) => [
      ...messages,
      { role: 'user', content: message, timestamp: new Date().toLocaleString() },
      {
        role: 'assistant', _content: '', get content() {
          return this._content
        },
        set content(value) {
          this._content = value
        },
        timestamp: new Date().toLocaleString()
      },
    ]);

    try {
      const response = await fetch('api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([...messages, { role: 'user', content: message }]),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let result = '';
      const processText = async ({ done, value }) => {
        if (done) {
          return result;
        }

        const text = decoder.decode(value || new Uint8Array(), { stream: true });
        setMessages((messages) => {
          const lastMessage = messages[messages.length - 1];
          const otherMessages = messages.slice(0, messages.length - 1);
          return [
            ...otherMessages,
            {
              ...lastMessage,
              content: lastMessage.content + text,
            },
          ];
        });

        result += text;
        return reader.read().then(processText);
      };

      await reader.read().then(processText);
    } catch (error) {
      console.error('Error in sendMessage:', error);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column" // Correct property name
      justifyContent="center"
      alignItems="center"
      bgcolor="#1a1a1a"
      p={3}
    >
      <Stack
        direction="column"
        width="100%"
        maxWidth="600px"
        height="100%"
        maxHeight="700px"
        bgcolor="#2c2c2c"
        border="1px solid #444"
        borderRadius={8}
        boxShadow="0 4px 12px rgba(0, 0, 0, 0.5)"
        p={3}
        spacing={3}
      >
        <Typography
          variant="h4"
          gutterBottom
          align="center"
          sx={{ color: '#bb86fc', fontWeight: 'bold' }}
        >
          RecipeAi
        </Typography>
        <Stack
          direction="column"
          spacing={2}
          flexGrow={1}
          overflow="auto"
          sx={{
            '&::-webkit-scrollbar': { width: '6px' },
            '&::-webkit-scrollbar-thumb': { backgroundColor: '#444', borderRadius: '10px' },
            '&::-webkit-scrollbar-track': { backgroundColor: '#2c2c2c' },
          }}
        >
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}>
              <Box
                key={index}
                display="flex"
                justifyContent={message.role === 'assistant' ? 'flex-start' : 'flex-end'}>
                <Box
                  bgcolor={message.role === 'assistant' ? '#3b3b3b' : 'se'}
                  color="white"
                  borderRadius={16}
                  p={3}
                  maxWidth="75%"
                  boxShadow="0 2px 8px rgba(0, 0, 0, 0.1)"
                >
                  {message.role === 'assistant' ? (
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  ) : (
                    message.content
                  )}
                  <Typography variant="caption" align={message.role === 'assistant' ? 'left' : 'right'} sx={{ color: '#bbbbbb' }} suppressHydrationWarning>
                    {message.timestamp}
                  </Typography>
                </Box>
              </Box>
            </motion.div>
          ))}
        </Stack>
        <Stack
          direction="row"
          spacing={2}
        >
          <TextField
            label="Type your message..."
            variant="outlined"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key == 'Enter') sendMessage();
            }}
            InputLabelProps={{
              shrink: true,
            }}
            sx={{
              bgcolor: '#333',
              borderRadius: '8px',
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: '#bb86fc', // Purple border
                },
                '&:hover fieldset': {
                  borderColor: '#9b30ff', // Darker purple on hover
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#bb86fc', // Bright purple when focused
                },
              },
              '& .MuiInputBase-input': {
                color: 'white', // White text
              },
              '& .MuiInputLabel-root': {
                color: '#bb86fc', // Purple label color
              },
            }}
          />
          <Button
            variant="contained"
            onClick={sendMessage}
            sx={{ bgcolor: '#bb86fc', color: 'white', '&:hover': { bgcolor: '#9b30ff' } }}
          >
            Send
          </Button>
          <Button
            variant="outlined"
            onClick={clearChat}
            sx={{
              color: '#bb86fc',
              borderColor: '#bb86fc',
              '&:hover': {
                borderColor: '#9b30ff',
                color: '#9b30ff',
              }
            }}
          >
            Clear Chat
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}