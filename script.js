// A variable to track if a label has been generated to enable PDF download
let labelGenerated = false;

// --- Main Generation Function ---
function generateLabel() {
    // 1. Get all inputs
    const sku = document.getElementById('sku-input').value.trim().toUpperCase();
    const upc = document.getElementById('upc-input').value.trim();
    const packageContent = document.getElementById('package-content-input').value.trim();
    const mrp = document.getElementById('mrp-input').value.trim();
    const netQuantity = document.getElementById('net-quantity-input').value.trim();

    const streamType = document.getElementById('stream-select').value; 
    const companyName = document.getElementById('company-input').value.trim(); 
    const dateOfImport = document.getElementById('doi-input').value.trim();

    const downloadBtn = document.getElementById('download-btn');
    
    // Simple validation
    if (!sku || !upc || !packageContent || !mrp || !netQuantity || !companyName || !dateOfImport) {
        alert("Please fill in all required input fields (including Company Name).");
        return;
    }
    
    if (upc.length !== 8 || isNaN(upc)) {
        alert("UPC code must be exactly 8 digits.");
        return;
    }

    // 2. Update Label Text Content 
    document.getElementById('label-sku').textContent = sku;
    document.getElementById('label-package').textContent = `Package Content - ${packageContent}`;
    document.getElementById('label-mrp').textContent = `MRP ${mrp} (Incl of All Taxes)`;
    
    // *** MODIFIED LOGIC: Update date label prefix ***

    // Determine the correct date label prefix based on the stream type
    let dateLabelPrefix = 'Month and Year of Import - ';
    if (streamType === 'Manufactured By-') {
        dateLabelPrefix = 'Month and Year of Manufacturing - ';
    }
    
    // Set the date line dynamically 
    const doiPrefixElement = document.getElementById('label-doi-prefix');
    if (doiPrefixElement) {
        doiPrefixElement.textContent = dateLabelPrefix;
    } 
    
    document.getElementById('label-doi').textContent = dateOfImport;

    // *** END OF MODIFIED LOGIC ***
    
    // Set the dynamic stream line
    document.getElementById('label-stream').textContent = `${streamType} ${companyName.toUpperCase()}`;
    
    document.getElementById('label-quantity').textContent = `Net Quantity - ${netQuantity}`;
    document.getElementById('label-upc').textContent = upc; // For the text below the barcode

    // 3. Generate Barcode using jsBarcode
    try {
        JsBarcode("#barcode-svg", upc, {
            format: "CODE128", 
            displayValue: false, 
            width: 1.5,      
            height: 40,      
            margin: 0         // Minimal margin to save space
        });
        
        labelGenerated = true;
        downloadBtn.disabled = false;
        
    } catch (error) {
        alert("Error generating barcode. Check the UPC format.\n" + error.message);
        labelGenerated = false;
        downloadBtn.disabled = true;
    }
}


// --- PDF Download Function (Uses html2canvas for reliability) ---
async function downloadPDF() {
    if (!labelGenerated) {
        alert("Please generate the label first.");
        return;
    }
    
    const labelElement = document.getElementById('label-content'); 
    const { jsPDF } = window.jspdf;
    
    if (!jsPDF || !window.html2canvas) {
        alert("jsPDF or html2canvas library not loaded. Please check your index.html file.");
        return;
    }

    try {
        // 1. Convert the label HTML element to an image (Canvas)
        const canvas = await html2canvas(labelElement, {
            scale: 3, // Use scale 3 for maximum PDF quality given the small size
            backgroundColor: '#ffffff', 
            useCORS: true 
        });

        const imgData = canvas.toDataURL('image/png');

        // Label dimensions in mm: 75mm (width) x 38mm (height)
        const labelWidthMM = 75;
        const labelHeightMM = 38;

        // 2. Create a new jsPDF document with custom dimensions
        const doc = new jsPDF({
            orientation: 'l',
            unit: 'mm',
            format: [labelWidthMM, labelHeightMM] 
        });

        // 3. Add the image data to the PDF (stretching it to fit the page dimensions)
        doc.addImage(imgData, 'PNG', 0, 0, labelWidthMM, labelHeightMM); 

        // 4. Final step: Save the PDF
        const sku = document.getElementById('sku-input').value.trim().toUpperCase();
        const upc = document.getElementById('upc-input').value.trim();
        doc.save(`Label_${sku}_${upc}_Full.pdf`);
        
        alert(`PDF for SKU: ${sku} (75mm x 38mm) generated successfully!`);

    } catch (error) {
        console.error("PDF generation failed:", error);
        alert("An error occurred during PDF generation. Check the console for details.");
    }
}

// Initial call to generate a sample label on load
document.addEventListener('DOMContentLoaded', () => {
    generateLabel();
});
