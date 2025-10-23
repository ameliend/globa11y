-- Remove AAA level criteria and obsolete criterion 4.1.1 from existing audits
DELETE FROM criteria_results 
WHERE level = 'AAA' OR code = '4.1.1';