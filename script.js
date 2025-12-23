let labelGenerated = false;

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
    
    // 2. Simple Validation (Constraint-free barcode data)
    if (!sku || !upc || !packageContent || !mrp || !netQuantity || !companyName || !dateOfImport) {
        alert("Please fill in all required fields.");
        return;
    }

    // 3. Update Label Text Content
    document.getElementById('label-sku').textContent = sku;
    document.getElementById('label-package').textContent = `Package Content - ${packageContent}`;
    document.getElementById('label-mrp').textContent = `MRP ${mrp} (Incl of All Taxes)`;
    
    // Set Date Prefix dynamically
    let dateLabelPrefix = streamType === 'Manufactured By-' ? 'Month and Year of Manufacturing - ' : 'Month and Year of Import - ';
    document.getElementById('label-doi-prefix').textContent = dateLabelPrefix;
    document.getElementById('label-doi').textContent = dateOfImport;
    
    document.getElementById('label-stream').textContent = `${streamType} ${companyName.toUpperCase()}`;
    document.getElementById('label-quantity').textContent = `Net Quantity - ${netQuantity}`;
    document.getElementById('label-upc').textContent = upc;

    // 4. Generate Barcode (CODE128 handles variable lengths and alphanumeric)
    try {
        JsBarcode("#barcode-svg", upc, {
            format: "CODE128", 
            displayValue: false, 
            // Adjust bar width based on length to ensure it fits the label
            width: upc.length > 15 ? 1 : 1.3, 
            height: 35,      
            margin: 0          
        });
        
        labelGenerated = true;
        downloadBtn.disabled = false;
    } catch (error) {
        alert("Error generating barcode: " + error.message);
        labelGenerated = false;
        downloadBtn.disabled = true;
    }
}

// PDF Download Function
async function downloadPDF() {
    if (!labelGenerated) return;
    
    const labelElement = document.getElementById('label-content'); 
    const { jsPDF } = window.jspdf;
    
    try {
        const canvas = await html2canvas(labelElement, {
            scale: 4, 
            backgroundColor: '#ffffff', 
            useCORS: true 
        });

        const imgData = canvas.toDataURL('image/png');
        const doc = new jsPDF({
            orientation: 'l',
            unit: 'mm',
            format: [75, 38] 
        });

        doc.addImage(imgData, 'PNG', 0, 0, 75, 38); 
        const sku = document.getElementById('sku-input').value.trim();
        doc.save(`Label_${sku}.pdf`);
        
    } catch (error) {
        console.error("PDF generation failed:", error);
        alert("An error occurred during PDF generation.");
    }
}

// Generate default label on load
document.addEventListener('DOMContentLoaded', generateLabel);
