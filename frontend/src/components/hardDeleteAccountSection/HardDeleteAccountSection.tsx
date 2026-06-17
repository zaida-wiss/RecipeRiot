import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteMyAccount, clearAuthData } from '../../api/authApi';
import DeleteAccountModal from '../deleteAccountModal/DeleteAccountModal';

type HardDeleteAccountSectionProps = {
  username: string;
};

const HardDeleteAccountSection = ({ username }: HardDeleteAccountSectionProps) => {
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDeleteAccount = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async (password: string) => {
    try {
      console.log('HardDeleteAccountSection: Before deleteMyAccount');
      await deleteMyAccount(password);
      console.log('HardDeleteAccountSection: After deleteMyAccount, before clearAuthData');
      clearAuthData();
      console.log('HardDeleteAccountSection: After clearAuthData');
    } catch (err) {
      console.error('Kunde inte radera kontot:', err);
      throw err;
    }
  };

  const handleDeleteSuccess = () => {
    window.onAccountDeleted?.();
    navigate('/');
  };

  return (
    <>
      <div className="settings-card settings-danger">
        <h3>Radera konto</h3>
        <p>Permanent borttagning av ditt konto och all relaterad data. Denna åtgärd kan inte ångras.</p>
        <button type="button" className="settings-btn settings-btn-danger" onClick={handleDeleteAccount}>
          Radera mitt konto
        </button>
      </div>

      {showDeleteModal && (
        <DeleteAccountModal
          username={username}
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowDeleteModal(false)}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </>
  );
};

export default HardDeleteAccountSection;
