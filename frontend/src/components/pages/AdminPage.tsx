

const AdminPage = () => {
  const navigate = useNavigate();
  const auth = getAuthData();

  // Skydda sidan — bara admin får vara här
  if (!auth || auth.user.role !== 'admin') {
    navigate('/');
    return null;
  };