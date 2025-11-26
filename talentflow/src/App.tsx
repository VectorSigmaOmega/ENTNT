import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient } from "@/lib/react-query";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import JobsList from "@/pages/jobs/JobsList"; // Import the new page

const Candidates = () => <div className="text-xl font-semibold text-gray-400">Candidates Module (Coming Soon)</div>;
const Assessments = () => <div className="text-xl font-semibold text-gray-400">Assessments Module (Coming Soon)</div>;

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="jobs" element={<JobsList />} /> {/* Updated Route */}
            <Route path="candidates" element={<Candidates />} />
            <Route path="assessments" element={<Assessments />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;