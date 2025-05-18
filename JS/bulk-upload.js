import { db } from './firebase-init.js';
import { ref, push } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-database.js";

document.addEventListener('DOMContentLoaded', () => {
    // Get all the buttons and elements we need
    const uploadBtn = document.getElementById('uploadTrigger');
    const fileInput = document.getElementById('csvFile');
    const fileNameDisplay = document.getElementById('fileName');
    const previewTable = document.getElementById('previewSection');
    const tableBody = document.getElementById('previewBody');
    const importBtn = document.getElementById('importData');
    const downloadBtn = document.getElementById('downloadSample');

    // When "Choose CSV File" button is clicked
    uploadBtn.onclick = () => fileInput.click();

    // When a file is selected
    fileInput.onchange = () => {
        const file = fileInput.files[0];
        if (file) {
            // Show the file name
            fileNameDisplay.textContent = file.name;
            // Read and show the file contents
            readFile(file);
        }
    };

    // When "Download Sample CSV" button is clicked
    downloadBtn.onclick = () => {
        // Create sample data
        const sampleData = [
            'Mentor ID,Mentor Name,Date & Time,Session Type,Duration (min),Rate (₹/hr)',
            '1,John Doe,2024-03-20 14:30,Live,45,800',
            '2,Jane Smith,2024-03-21 15:00,Evaluation,60,900'
        ].join('\n');

        // Create and trigger download
        const blob = new Blob([sampleData], { type: 'text/csv' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'sample_sessions.csv';
        link.click();
    };

    // Function to read the uploaded file
    function readFile(file) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const text = e.target.result;
            const rows = text.split('\n');
            
            // Clear previous data
            tableBody.innerHTML = '';
            
            // Add each row to the preview table (skip header row)
            rows.slice(1).forEach(row => {
                if (row.trim() === '') return;
                
                const columns = row.split(',');
                const tr = document.createElement('tr');
                
                columns.forEach(col => {
                    const td = document.createElement('td');
                    td.textContent = col.trim();
                    tr.appendChild(td);
                });
                
                tableBody.appendChild(tr);
            });
            
            // Show the preview table
            previewTable.style.display = 'block';
        };
        
        reader.readAsText(file);
    }

    // When "Import Data" button is clicked
    importBtn.onclick = async () => {
        try {
            // Get all rows from preview table
            const rows = tableBody.getElementsByTagName('tr');
            
            // Change button text to show loading
            importBtn.textContent = 'Importing...';
            
            // Import each row to Firebase
            for (const row of rows) {
                const cells = row.getElementsByTagName('td');
                
                const data = {
                    mentorId: cells[0].textContent,
                    "Mentor Name": cells[1].textContent,
                    Date: cells[2].textContent,
                    Type: cells[3].textContent,
                    duration: Number(cells[4].textContent) || 0,
                    ratePerHour: Number(cells[5].textContent) || 0
                };

                // Save to Firebase
                await push(ref(db, 'sessions'), data);
            }

            // Show success message
            alert('Successfully imported all sessions!');
            
            // Clear everything
            previewTable.style.display = 'none';
            fileNameDisplay.textContent = '';
            fileInput.value = '';
            
        } catch (error) {
            // Show error message if something goes wrong
            alert('Error importing sessions. Please try again.');
            console.error(error);
            
        } finally {
            // Reset button text
            importBtn.textContent = '📤 Import Data';
        }
    };
}); 