import { exportMyData } from '../../api/authApi';

const ExportDataSection = () => {
  const handleExportData = async () => {
    try {
      await exportMyData();
    } catch (err) {
      console.error('Kunde inte exportera data:', err);
      alert('Kunde inte exportera data. Försök igen senare.');
    }
  };

  return (
    <div className="settings-card">
      <h3>Exportera data</h3>
      <p>Ladda ner en kopia av all din data enligt GDPR.</p>
      <button type="button" className="settings-btn" onClick={handleExportData}>
        Exportera mina data
      </button>
    </div>
  );
};

export default ExportDataSection;
