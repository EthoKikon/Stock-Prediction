function showStatus() {
    var companySelect = document.getElementById("company-select");
    var selectedCompany = companySelect.value;
    var statusContainer = document.getElementById("status-container");

    // Clear previous status
    statusContainer.innerHTML = "";

    // Make AJAX request to Flask server to get stock data
    fetch(`/get_stock_data/${selectedCompany}`)
        .then(response => response.json())
        .then(data => {
            // Create elements to display status based on selected company
            var statusHeader = document.createElement("h2");
            var stockPrice = document.createElement("p");
            var stockGraph = document.createElement("img");

            // Update content based on response data
            statusHeader.textContent = data.company;

            // Check if price is defined before displaying it
            if (data.price) {
                stockPrice.textContent = `Stock Price: ${data.price}`;
            } else {
                stockPrice.textContent = "Stock Price: Price not available";
            }

            // Check if graph URL is defined before setting its src attribute
            if (data.graph) {
                 // Set the src attribute of the image element to the graph URL
                stockGraph.src = data.graph;
                stockGraph.alt = "Stock Graph"; // Add alt text for accessibility
                stockGraph.classList.add("stock-graph"); // Add a CSS class for styling
            } else {
                // Handle case where graph URL is not provided
                stockGraph.textContent = "Graph not available"; // Provide a placeholder image
            }

            // Append elements to statusContainer
            statusContainer.appendChild(statusHeader);
            statusContainer.appendChild(stockPrice);
            statusContainer.appendChild(stockGraph);
        })
        .catch(error => console.error('Error:', error));
}

// showStatus initially to display stock data
showStatus();

// Update every three seconds
setInterval(showStatus, 3000);
