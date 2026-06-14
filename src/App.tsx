import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Feed from "./pages/Feed.tsx";
import Quiz from "./pages/Quiz.tsx";
import QuizResults from "./pages/QuizResults.tsx";
import Stories from "./pages/Stories.tsx";
import Groups from "./pages/Groups.tsx";
import Auth from "./pages/Auth.tsx";
import ResourceProfile from "./pages/ResourceProfile.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Library from "./pages/Library.tsx";
import Profile from "./pages/Profile.tsx";
import LearningHub from "./pages/LearningHub.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/quiz/results" element={<QuizResults />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/stories" element={<Stories />} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/resources/:id" element={<ResourceProfile />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/library" element={<Library />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/hub" element={<LearningHub />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
