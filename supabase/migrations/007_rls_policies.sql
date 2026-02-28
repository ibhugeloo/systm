-- ========================================
-- Row Level Security Policies
-- ========================================

-- ========================================
-- PROFILES TABLE POLICIES
-- ========================================
-- Users can read their own profile
CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Admins can read all profiles
CREATE POLICY "Admins can read all profiles" ON public.profiles
  FOR SELECT
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admins can update any profile
CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- ========================================
-- CLIENTS TABLE POLICIES
-- ========================================
-- Team members can read/write assigned clients
CREATE POLICY "Team members can read assigned clients" ON public.clients
  FOR SELECT
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('team_member', 'admin')
    OR assigned_to = auth.uid()
  );

-- Clients can read their own client record
CREATE POLICY "Clients can read own client" ON public.clients
  FOR SELECT
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'client'
    AND id::text = auth.uid()::text
  );

-- Admins can read all clients
CREATE POLICY "Admins can read all clients" ON public.clients
  FOR SELECT
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- Team members can insert clients
CREATE POLICY "Team members can insert clients" ON public.clients
  FOR INSERT
  WITH CHECK (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('team_member', 'admin')
  );

-- Team members can update assigned clients
CREATE POLICY "Team members can update assigned clients" ON public.clients
  FOR UPDATE
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('team_member', 'admin')
    AND assigned_to = auth.uid()
  )
  WITH CHECK (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('team_member', 'admin')
  );

-- Admins can update all clients
CREATE POLICY "Admins can update all clients" ON public.clients
  FOR UPDATE
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- ========================================
-- MVPS TABLE POLICIES (inherit from parent client)
-- ========================================
-- Team members can read MVPs from assigned clients
CREATE POLICY "Team members can read assigned client MVPs" ON public.mvps
  FOR SELECT
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('team_member', 'admin')
    AND client_id IN (
      SELECT id FROM public.clients WHERE assigned_to = auth.uid() OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    )
  );

-- Clients can read their own MVPs
CREATE POLICY "Clients can read own MVPs" ON public.mvps
  FOR SELECT
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'client'
    AND client_id::text = auth.uid()::text
  );

-- Admins can read all MVPs
CREATE POLICY "Admins can read all MVPs" ON public.mvps
  FOR SELECT
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- Team members can insert MVPs for assigned clients
CREATE POLICY "Team members can insert MVPs" ON public.mvps
  FOR INSERT
  WITH CHECK (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('team_member', 'admin')
    AND client_id IN (
      SELECT id FROM public.clients WHERE assigned_to = auth.uid() OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    )
  );

-- Team members can update MVPs for assigned clients
CREATE POLICY "Team members can update MVPs" ON public.mvps
  FOR UPDATE
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('team_member', 'admin')
    AND client_id IN (
      SELECT id FROM public.clients WHERE assigned_to = auth.uid() OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    )
  );

-- ========================================
-- CONVERSATIONS TABLE POLICIES
-- ========================================
-- Team members can read conversations from assigned clients
CREATE POLICY "Team members can read assigned client conversations" ON public.conversations
  FOR SELECT
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('team_member', 'admin')
    AND client_id IN (
      SELECT id FROM public.clients WHERE assigned_to = auth.uid() OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    )
  );

-- Clients can read their own conversations
CREATE POLICY "Clients can read own conversations" ON public.conversations
  FOR SELECT
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'client'
    AND client_id::text = auth.uid()::text
  );

-- Admins can read all conversations
CREATE POLICY "Admins can read all conversations" ON public.conversations
  FOR SELECT
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- Team members can insert conversations for assigned clients
CREATE POLICY "Team members can insert conversations" ON public.conversations
  FOR INSERT
  WITH CHECK (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('team_member', 'admin')
  );

-- Team members can update conversations for assigned clients
CREATE POLICY "Team members can update conversations" ON public.conversations
  FOR UPDATE
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('team_member', 'admin')
  );

-- ========================================
-- HANDOFFS TABLE POLICIES
-- ========================================
-- Team members can read handoffs from assigned clients
CREATE POLICY "Team members can read assigned client handoffs" ON public.handoffs
  FOR SELECT
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('team_member', 'admin')
    AND client_id IN (
      SELECT id FROM public.clients WHERE assigned_to = auth.uid() OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    )
  );

-- Clients can read their own handoffs
CREATE POLICY "Clients can read own handoffs" ON public.handoffs
  FOR SELECT
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'client'
    AND client_id::text = auth.uid()::text
  );

-- Admins can read all handoffs
CREATE POLICY "Admins can read all handoffs" ON public.handoffs
  FOR SELECT
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- Team members can insert handoffs
CREATE POLICY "Team members can insert handoffs" ON public.handoffs
  FOR INSERT
  WITH CHECK (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('team_member', 'admin')
  );

-- Team members can update handoffs for assigned clients
CREATE POLICY "Team members can update handoffs" ON public.handoffs
  FOR UPDATE
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('team_member', 'admin')
  );

-- ========================================
-- CLIENT_REQUESTS TABLE POLICIES
-- ========================================
-- Clients can insert their own requests
CREATE POLICY "Clients can insert own requests" ON public.client_requests
  FOR INSERT
  WITH CHECK (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'client'
    AND client_id::text = auth.uid()::text
  );

-- Clients can read their own requests
CREATE POLICY "Clients can read own requests" ON public.client_requests
  FOR SELECT
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'client'
    AND client_id::text = auth.uid()::text
  );

-- Team members can read all requests for assigned clients
CREATE POLICY "Team members can read assigned client requests" ON public.client_requests
  FOR SELECT
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('team_member', 'admin')
    AND client_id IN (
      SELECT id FROM public.clients WHERE assigned_to = auth.uid() OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    )
  );

-- Admins can read all requests
CREATE POLICY "Admins can read all requests" ON public.client_requests
  FOR SELECT
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- Team members can update requests
CREATE POLICY "Team members can update requests" ON public.client_requests
  FOR UPDATE
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('team_member', 'admin')
  );

-- Admins can update all requests
CREATE POLICY "Admins can update all requests" ON public.client_requests
  FOR UPDATE
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );
