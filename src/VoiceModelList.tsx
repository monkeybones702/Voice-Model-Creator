import { useState, useEffect } from 'react';
import { db, auth } from './main';
import { collection, query, where, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from './firebaseUtils';

interface VoiceModel {
  id: string;
  name: string;
  audioUrl: string;
  status: string;
}

export default function VoiceModelList() {
  const [models, setModels] = useState<VoiceModel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'voiceModels'),
      where('userId', '==', auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedModels: VoiceModel[] = [];
        snapshot.forEach((doc) => {
          fetchedModels.push({ id: doc.id, ...doc.data() } as VoiceModel);
        });
        setModels(fetchedModels);
        setLoading(false);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'voiceModels');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'voiceModels', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `voiceModels/${id}`);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Your Voice Models</h2>
      {models.length === 0 ? (
        <p>No voice models found.</p>
      ) : (
        <ul className="space-y-2">
          {models.map((model) => (
            <li key={model.id} className="border p-2 rounded flex justify-between items-center">
              <div>
                <p className="font-semibold">{model.name}</p>
                <p className="text-sm text-gray-500">Status: {model.status}</p>
                <a href={model.audioUrl} className="text-blue-500 text-sm">Download Audio</a>
              </div>
              <button onClick={() => handleDelete(model.id)} className="bg-red-500 text-white p-1 rounded">
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
