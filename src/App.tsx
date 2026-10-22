/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { db, auth } from './main';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import VoiceModelList from './VoiceModelList';

export default function App() {
  const [name, setName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState('');

  const handleUpload = async () => {
    if (!auth.currentUser) {
      setStatus('Please sign in first.');
      return;
    }
    if (!name || !file) {
      setStatus('Please provide a name and audio file.');
      return;
    }

    setStatus('Uploading...');
    try {
      // In a real app, upload file to Firebase Storage here.
      // For now, we simulate with a dummy URL.
      const audioUrl = `https://storage.googleapis.com/voice-models/${uuidv4()}.wav`;
      
      await addDoc(collection(db, 'voiceModels'), {
        id: uuidv4(),
        name,
        userId: auth.currentUser.uid,
        audioUrl,
        createdAt: serverTimestamp(),
        status: 'pending'
      });
      setStatus('Voice model created successfully!');
      setName('');
      setFile(null);
    } catch (error) {
      console.error(error);
      setStatus('Failed to create voice model.');
    }
  };

  return (
    <div className="p-4 space-y-8">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Create Voice Model</h1>
        <input
          type="text"
          placeholder="Model Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 w-full"
        />
        <input
          type="file"
          accept="audio/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="border p-2 w-full"
        />
        <button onClick={handleUpload} className="bg-blue-500 text-white p-2 rounded">
          Create Model
        </button>
        <p>{status}</p>
      </div>
      <VoiceModelList />
    </div>
  );
}
