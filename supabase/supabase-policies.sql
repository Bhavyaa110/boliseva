-- Enable RLS
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Policy: Allow users to select their own documents
CREATE POLICY "Users can select their own documents"
  ON documents
  FOR SELECT
  USING (id = auth.uid());

-- Policy: Allow users to insert their own documents
CREATE POLICY "Users can insert their own documents"
  ON documents
  FOR INSERT
  WITH CHECK (id = auth.uid());

-- Policy: Allow users to update their own documents
CREATE POLICY "Users can update their own documents"
  ON documents
  FOR UPDATE
  USING (id = auth.uid());

-- Policy: Allow users to delete their own documents
CREATE POLICY "Users can delete their own documents"
  ON documents
  FOR DELETE
  USING (id = auth.uid());
