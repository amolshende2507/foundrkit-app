import { useState } from 'react';
import axios from 'axios'; // We'll need to install this if you haven't

const ProposalPage = () => {
  const [clientName, setClientName] = useState('');
  const [projectSummary, setProjectSummary] = useState('');
  const [tone, setTone] = useState('Professional');
  const [generatedProposal, setGeneratedProposal] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setGeneratedProposal('');

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/proposals/generate', {
        client_name: clientName,
        project_summary: projectSummary,
        tone: tone,
      });
      setGeneratedProposal(response.data.proposal_text);
    } catch (error) {
      console.error("Error generating proposal:", error);
      alert("Failed to generate proposal. Please check the console for details.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2>AI Proposal Generator</h2>
      <form onSubmit={handleGenerate}>
        <div>
          <label>Client Name:</label>
          <input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} required />
        </div>
        <div>
          <label>Project Summary:</label>
          <textarea value={projectSummary} onChange={(e) => setProjectSummary(e.target.value)} required />
        </div>
        <div>
          <label>Tone:</label>
          <select value={tone} onChange={(e) => setTone(e.target.value)}>
            <option>Professional</option>
            <option>Friendly</option>
            <option>Persuasive</option>
          </select>
        </div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Generating...' : 'Generate Proposal'}
        </button>
      </form>

      {generatedProposal && (
        <div style={{ marginTop: '20px', whiteSpace: 'pre-wrap', border: '1px solid #ccc', padding: '10px' }}>
          <h3>Generated Proposal:</h3>
          <p>{generatedProposal}</p>
        </div>
      )}
    </div>
  );
};

export default ProposalPage;