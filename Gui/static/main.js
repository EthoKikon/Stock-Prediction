var chart;
var sentimentChart;
var chartData = {
    labels: [],
    datasets: [{
        label: 'Stock Price',
        data: [],
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
    }]
};

function showStatus(triggered = false) {
    var companySelect = document.getElementById("company-select");
    var selectedCompany = companySelect.value;
    var statusContainer = document.getElementById("status-container");
    var newsContainer = document.getElementById("news-container");
    var sentimentContainer = document.getElementById("sentiment-container");

    if (triggered) {
        // Make AJAX request to Flask server to get stock data
        fetch(`/get_stock_data/${selectedCompany}`)
            .then(response => response.json())
            .then(data => {
                // Update stock price
                statusContainer.innerHTML = `<h2>${data.company}</h2><p>Stock Price: ${data.price}</p>`;

                 // Parse stock price to remove currency symbol and convert to float
                var price = parseFloat(data.price.replace(/[^0-9.-]+/g, ''));

             if (!isNaN(price)) { // Check if price is a valid number
                    // Update Chart.js data
                    var currentDate = new Date().toLocaleTimeString();
                    chartData.labels.push(currentDate);
                    chartData.datasets[0].data.push(price);

                    console.log("Chart data:", chartData); // Log chartData for debugging

                    // Limit data to show only last 10 points
                    if (chartData.labels.length > 10) {
                        chartData.labels.shift();
                        chartData.datasets[0].data.shift();
                 }

                    // Update Chart.js chart
                    chart.update();
                } else {
                    console.error("Error parsing stock price:", data.price);
                }

                // Update sentiment analysis text (placeholder)
                var sentiment = "Positive";
                var sentimentTextValue = document.getElementById("sentiment-text-value");
                sentimentTextValue.textContent = sentiment;

                // Update news content
                var newsContent = `<h2>Latest News</h2>`;
                data.news_headlines.forEach(function (newsItem) {
                
                    newsContent += `
                        <div class="news-item">
                            <h3>${newsItem.headline}</h3>
                            <p class="news-details">Source: <span class="news-source">${newsItem.source}</span>, Time: <span class="news-time">${newsItem.time}</span></p>
                            <a href="#">Read more</a>
                        </div>
                    `;    
                }); 
                newsContainer.innerHTML = newsContent;
            })
            .catch(error => console.error('Error:', error));
    }
}

// Event listener for the "Show Status" button
document.getElementById("show-status-button").addEventListener("click", function() {
    showStatus(true);
});

// Call showStatus initially to prepare the status display and start dynamic updates
showStatus(true);

// Create Chart.js chart
var ctx = document.getElementById('stock-chart').getContext('2d');
chart = new Chart(ctx, {
    type: 'line',
    data: chartData,
    options: {
        scales: {
            x: {
                display: true,
                title: {
                    display: true,
                    text: 'Time'
                }
            },
            y: {
                display: true,
                title: {
                    display: true,
                    text: 'Stock Price'
                }
            }
        }
    }
});

// Update every three seconds
setInterval(function() {
    showStatus(true);
}, 3000);

// Initialize sentiment chart on page load
initializeSentimentChart();

// Function to initialize the sentiment chart
function initializeSentimentChart() {
    sentimentChart = new Chart(document.getElementById('sentiment-chart').getContext('2d'), {
        type: 'pie',
        data: {
            labels: ["Positive", "Negative", "Neutral"],
            datasets: [{
                label: 'Sentiment Analysis',
                data: [50, 30, 20],
                backgroundColor: [
                    'rgb(75, 192, 192)',
                    'rgb(255, 99, 132)',
                    'rgb(255, 205, 86)'
                ],
                hoverOffset: 4
            }]
        },
        options: {
            maintainAspectRatio: false, // Set to false to allow chart resizing
            responsive: true,
            aspectRatio: 1.3, // Adjust aspect ratio for a larger chart
            plugins: {
                legend: {
                    position: 'bottom',
                },
            },
            layout: {
                padding: {
                    left: 10,
                    right: 10,
                    top: 10,
                    bottom: 10
                }
            }
        }
    });
}
