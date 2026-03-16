import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import NoteDetail from "@/pages/NoteDetail";
import CategoryPage from "@/pages/CategoryPage";
import AdminStats from "@/pages/admin/AdminStats";
import AdminCategories from "@/pages/admin/AdminCategories";
import AdminNotes from "@/pages/admin/AdminNotes";
import AdminBanner from "@/pages/admin/AdminBanner";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [location]);
  return null;
}

function Router() {
  return (
    <>
      <ScrollToTop />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/category/:id" component={CategoryPage} />
        <Route path="/note/:id" component={NoteDetail} />

        {/* Admin Routes */}
        <Route path="/admin" component={AdminStats} />
        <Route path="/admin/categories" component={AdminCategories} />
        <Route path="/admin/notes" component={AdminNotes} />
        <Route path="/admin/banner" component={AdminBanner} />

        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
