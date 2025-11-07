import { exec } from 'child_process';

// Compile TypeScript to JavaScript
exec('tsc scripts/createSubscribersTable.ts', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error compiling TypeScript: ${stderr}`);
    return;
  }
  console.log(`Compiled successfully: ${stdout}`);

  // Run the compiled JavaScript file
  exec('node scripts/createSubscribersTable.js', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error running JavaScript: ${stderr}`);
      return;
    }
    console.log(`Output: ${stdout}`);
  });
});