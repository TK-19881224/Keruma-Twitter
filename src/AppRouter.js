import { PostProvider } from './PostContext';
import App from './App';
import Profile from './Profile';
import {
  BrowserRouter as Router,
  Route,
  Routes
} from 'react-router-dom';
import EditProfile from './EditProfile';

function AppRouter() {
  return (
    <PostProvider>
      <Router>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/profile/:uid" element={<Profile />} />
          <Route path="/edit-profile" element={<EditProfile/>}/>
        </Routes>
      </Router>
    </PostProvider>
  )
}
export default AppRouter;