import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import RoleRoute from "./components/RoleRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ReaderBrowse from "./pages/reader/ReaderBrowse";

import ReaderHome from "./pages/reader/ReaderHome";
import ReaderLibrary from "./pages/reader/ReaderLibrary";
import ReaderStories from "./pages/reader/ReaderStories";
import ReaderStory from "./pages/reader/ReaderStory";
import ReaderRead from "./pages/reader/ReaderRead";
import ReaderFavorites from "./pages/reader/ReaderFavorites";
import ReaderHistory from "./pages/reader/ReaderHistory";
import ReaderProfile from "./pages/reader/ReaderProfile";

import WriterDashboard from "./pages/writer/WriterDashboard";
import MyStories from "./pages/writer/MyStories";
import CreateStory from "./pages/writer/CreateStory";
import StoryBuilder from "./pages/writer/StoryBuilder";
import WriterProfile from "./pages/writer/WriterProfile";

import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageUsers from "./pages/admin/ManageUsers";
import ManageStories from "./pages/admin/ManageStories";
import ReviewStory from "./pages/admin/ReviewStory";
import ManageComments from "./pages/admin/ManageComments";
import Reports from "./pages/admin/Reports";
import AdminSettings from "./pages/admin/AdminSettings";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/browse" element={<ReaderBrowse />} />

          {/* Reader area */}
          <Route path="/reader/login" element={<Login area="READER" />} />
          <Route path="/reader/signup" element={<Signup area="READER" />} />
          <Route path="/reader/home" element={<RoleRoute area="READER"><ReaderHome /></RoleRoute>} />
          <Route path="/reader/library" element={<RoleRoute area="READER"><ReaderLibrary /></RoleRoute>} />
          <Route path="/reader/stories" element={<RoleRoute area="READER"><ReaderStories /></RoleRoute>} />
          <Route path="/reader/favorites" element={<RoleRoute area="READER"><ReaderFavorites /></RoleRoute>} />
          <Route path="/reader/history" element={<RoleRoute area="READER"><ReaderHistory /></RoleRoute>} />
          <Route path="/reader/profile" element={<RoleRoute area="READER"><ReaderProfile /></RoleRoute>} />
          <Route path="/reader/story/:storyId" element={<RoleRoute area="READER"><ReaderStory /></RoleRoute>} />
          <Route path="/reader/read/:storyId" element={<RoleRoute area="READER"><ReaderRead /></RoleRoute>} />

          {/* Writer area */}
          <Route path="/writer/login" element={<Login area="WRITER" />} />
          <Route path="/writer/signup" element={<Signup area="WRITER" />} />
          <Route path="/writer/dashboard" element={<RoleRoute area="WRITER"><WriterDashboard /></RoleRoute>} />
          <Route path="/writer/stories" element={<RoleRoute area="WRITER"><MyStories /></RoleRoute>} />
          <Route path="/writer/create" element={<RoleRoute area="WRITER"><CreateStory /></RoleRoute>} />
          <Route path="/writer/edit/:storyId" element={<RoleRoute area="WRITER"><StoryBuilder /></RoleRoute>} />
          <Route path="/writer/profile" element={<RoleRoute area="WRITER"><WriterProfile /></RoleRoute>} />

          {/* Admin area — login only, no signup */}
          <Route path="/admin/login" element={<Login area="ADMIN" />} />
          <Route path="/admin/dashboard" element={<RoleRoute area="ADMIN"><AdminDashboard /></RoleRoute>} />
          <Route path="/admin/users" element={<RoleRoute area="ADMIN"><ManageUsers /></RoleRoute>} />
          <Route path="/admin/readers" element={<RoleRoute area="ADMIN"><ManageUsers initialTab="READER" /></RoleRoute>} />
          <Route path="/admin/writers" element={<RoleRoute area="ADMIN"><ManageUsers initialTab="WRITER" /></RoleRoute>} />
          <Route path="/admin/stories" element={<RoleRoute area="ADMIN"><ManageStories /></RoleRoute>} />
          <Route path="/admin/stories/:id/review" element={<RoleRoute area="ADMIN"><ReviewStory /></RoleRoute>} />
          <Route path="/admin/comments" element={<RoleRoute area="ADMIN"><ManageComments /></RoleRoute>} />
          <Route path="/admin/reports" element={<RoleRoute area="ADMIN"><Reports /></RoleRoute>} />
          <Route path="/admin/settings" element={<RoleRoute area="ADMIN"><AdminSettings /></RoleRoute>} />

          <Route path="/login" element={<Navigate to="/reader/login" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
