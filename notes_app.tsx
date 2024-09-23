import React, { useState, useEffect } from 'react';
import { Trash2, FileText, Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const NotesApp = () => {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [summary, setSummary] = useState('');

  useEffect(() => {
    const savedNotes = localStorage.getItem('notes');
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(notes));
  }, [notes]);

  const createNote = () => {
    const newNote = {
      id: Date.now(),
      title: 'New Note',
      content: '',
      createdAt: new Date().toLocaleString(),
    };
    setNotes([...notes, newNote]);
    setSelectedNote(newNote);
  };

  const updateNote = (id, updates) => {
    const updatedNotes = notes.map(note =>
      note.id === id ? { ...note, ...updates } : note
    );
    setNotes(updatedNotes);
    if (selectedNote && selectedNote.id === id) {
      setSelectedNote({ ...selectedNote, ...updates });
    }
  };

  const deleteNote = (id) => {
    const filteredNotes = notes.filter(note => note.id !== id);
    setNotes(filteredNotes);
    if (selectedNote && selectedNote.id === id) {
      setSelectedNote(null);
    }
  };

  const summarizeNote = async () => {
    if (!selectedNote) return;
    // Simulating AI summarization with a simple algorithm
    // This is a placeholder. In a real application, you'd call an AI service here.
    const words = selectedNote.content.split(' ');
    const summaryWords = words.slice(0, 30).join(' ');
    setSummary(`${summaryWords}... This is a concise summary to demonstrate scrolling. It continues with a bit more text to ensure we have enough content to necessitate scrolling in our popup.`);
  };

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gradient-to-br from-purple-700 via-blue-800 to-gray-900">
      <div className="w-1/4 p-4 overflow-y-auto">
        <Button onClick={createNote} className="w-full mb-4 bg-green-500 hover:bg-green-600">
          <Plus className="mr-2" /> Add Note
        </Button>
        {filteredNotes.map(note => (
          <Card 
            key={note.id} 
            className={`mb-2 p-2 cursor-pointer ${selectedNote && selectedNote.id === note.id ? 'bg-blue-100' : 'bg-white'}`}
            onClick={() => setSelectedNote(note)}
          >
            <h3 className="font-bold">{note.title}</h3>
            <p className="text-sm text-gray-500">{note.createdAt}</p>
          </Card>
        ))}
      </div>
      <div className="flex-1 flex flex-col h-full bg-white">
        {selectedNote ? (
          <>
            <div className="flex justify-between p-4 bg-white z-10">
              <input
                value={selectedNote.title}
                onChange={(e) => updateNote(selectedNote.id, { title: e.target.value })}
                className="text-2xl font-bold w-1/2 focus:outline-none"
              />
              <div className="flex space-x-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Search className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Search notes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </PopoverContent>
                </Popover>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button onClick={summarizeNote} variant="outline" size="icon">
                      <FileText className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-2">
                      <h3 className="font-bold">Summary</h3>
                      <div className="h-[100px] w-full rounded-md border p-2 overflow-y-auto">
                        <p>{summary || "Click to generate summary"}</p>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                <Button onClick={() => deleteNote(selectedNote.id)} variant="outline" size="icon">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <textarea
                className="w-full h-full p-2 focus:outline-none resize-none bg-transparent"
                value={selectedNote.content}
                onChange={(e) => updateNote(selectedNote.id, { content: e.target.value })}
                placeholder="Start typing your note here..."
              />
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a note or create a new one
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesApp;
