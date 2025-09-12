import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const DatabaseCheck = () => {
  const [tableExists, setTableExists] = useState<boolean | null>(null);
  const [submissionCount, setSubmissionCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkTable = async () => {
    try {
      setError(null);
      
      // Try to query the table
      const { data, error: queryError } = await supabase
        .from('contact_submissions')
        .select('id')
        .limit(1);

      if (queryError) {
        console.error('Table check error:', queryError);
        if (queryError.message?.includes('relation "public.contact_submissions" does not exist')) {
          setTableExists(false);
          setError('Contact submissions table does not exist - migration needs to be applied');
        } else {
          setTableExists(false);
          setError(`Database error: ${queryError.message}`);
        }
        return;
      }

      setTableExists(true);
      
      // Get count
      const { count, error: countError } = await supabase
        .from('contact_submissions')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        setError(`Count error: ${countError.message}`);
      } else {
        setSubmissionCount(count || 0);
      }

    } catch (error) {
      console.error('Check failed:', error);
      setError(`Failed to check database: ${error.message}`);
    }
  };

  const createTestSubmission = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_submissions')
        .insert({
          name: 'Test User',
          email: 'test@example.com',
          phone: '555-123-4567',
          message: 'This is a test submission created from the admin panel.',
          source: 'admin_test',
          status: 'new'
        })
        .select()
        .single();

      if (error) throw error;
      
      console.log('Test submission created:', data);
      checkTable(); // Refresh
    } catch (error) {
      console.error('Failed to create test submission:', error);
      setError(`Failed to create test submission: ${error.message}`);
    }
  };

  useEffect(() => {
    checkTable();
  }, []);

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Database Status Check</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <strong>Table exists:</strong> {tableExists === null ? 'Checking...' : tableExists ? '✅ Yes' : '❌ No'}
        </div>
        
        <div>
          <strong>Submission count:</strong> {submissionCount === null ? 'N/A' : submissionCount}
        </div>
        
        {error && (
          <div className="p-3 bg-red-100 border border-red-300 rounded text-red-700">
            <strong>Error:</strong> {error}
          </div>
        )}

        <div className="flex gap-2">
          <Button onClick={checkTable} variant="outline" size="sm">
            Refresh Check
          </Button>
          
          {tableExists && (
            <Button onClick={createTestSubmission} variant="outline" size="sm">
              Create Test Submission
            </Button>
          )}
        </div>

        {!tableExists && (
          <div className="p-3 bg-yellow-100 border border-yellow-300 rounded text-yellow-800">
            <strong>Migration Required:</strong> The contact_submissions table needs to be created. 
            Run: <code>supabase db reset</code> or apply the migration manually.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DatabaseCheck;