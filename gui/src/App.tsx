import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { NewThread } from './pages/NewThread';
import { ThreadView } from './pages/ThreadView';

// Redirect component that preserves query params
function RedirectWithParams({ to }: { to: string }): JSX.Element {
  const location = useLocation();
  return <Navigate to={`${to}${location.search}`} replace />;
}

function App(): JSX.Element {
  return (
    <Routes>
      <Route path="/" element={<RedirectWithParams to="/new" />} />
      <Route path="/new" element={<NewThread />} />
      <Route path="/thread/:threadId" element={<ThreadView />} />
    </Routes>
  );
}

export default App;
