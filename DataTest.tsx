// Test component to verify dabbaflowData system is working
import { useState, useEffect } from 'react';
import { useDabbaflowData } from '@/lib/dabbaflowData';

const DataTest = () => {
  const { data, addOrder, getAllOrders } = useDabbaflowData();
  const [testOrder, setTestOrder] = useState('');

  const handleAddTestOrder = () => {
    const newOrder = {
      type: 'Food',
      details: {
        restaurant: 'Test Restaurant',
        items: [{ name: 'Test Item', quantity: 1, price: 50 }],
        deliveryLocation: 'Test Location'
      },
      status: 'Pending',
      customer: 'Test User',
      price: 50
    };
    
    addOrder(newOrder);
    setTestOrder(newOrder.id || `Test_${Date.now()}`);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Data Sync Test</h2>
      
      <div className="bg-white p-4 rounded-lg shadow mb-4">
        <h3 className="font-semibold mb-2">Current Orders: {getAllOrders().length}</h3>
        <button
          onClick={handleAddTestOrder}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add Test Order
        </button>
        {testOrder && (
          <p className="text-green-600 mt-2">Added: {testOrder}</p>
        )}
      </div>
      
      <div className="bg-gray-100 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Raw Data:</h3>
        <pre className="text-xs overflow-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default DataTest;
