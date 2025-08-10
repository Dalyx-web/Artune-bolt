@@ .. @@
 import ArtistProfile from './pages/ArtistProfile';
 import Messages from './pages/Messages';
 import Admin from './pages/Admin';
+import ModerationTest from './pages/ModerationTest';
 import { Toaster } from '@/components/ui/toaster';
 import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
 
@@ .. @@
           <Route path="/artist/:id" element={<ArtistProfile />} />
           <Route path="/messages" element={<Messages />} />
           <Route path="/admin" element={<Admin />} />
+          <Route path="/admin/moderation-test" element={<ModerationTest />} />
         </Routes>
         <Toaster />
       </div>

export default ModerationTest