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

                // Update sentiment analysis text
                var sentiment = "Positive";
                var sentimentTextValue = document.getElementById("sentiment-text-value");
                sentimentTextValue.textContent = sentiment;
                
                 // Make AJAX request to predict sentiment for scraped news headlines
                fetch('/predict_sentiment', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ news_headlines: data.news_headlines })
                })
                .then(response => response.json())
                .then(sentimentData => {
                   // Update sentiment chart based on sentiment counts
                   var positiveCount = sentimentData.positive_count;
                   var negativeCount = sentimentData.negative_count;
                   var neutralCount = sentimentData.neutral_count;
    
                   sentimentChart.data.labels = ['Positive', 'Negative', 'Neutral'];
                   sentimentChart.data.datasets[0].data = [positiveCount, negativeCount, neutralCount];
                   sentimentChart.update();
                })
                .catch(error => console.error('Error predicting sentiment:', error));

               // Update news content
                var newsContent = `<h2>Latest News</h2>`;
                data.news_headlines.forEach(function (newsItem) {
                var sentimentScore = newsItem.sentiment_score === 1 ? "Positive" : (newsItem.sentiment_score === 0 ? "Negative" : "Neutral");
                var sentimentStyle = newsItem.sentiment_score === 1 ? "color: green; font-weight: bold; font-size: 16px;" : (newsItem.sentiment_score === 0 ? "color: red; font-weight: bold; font-size: 16px;" : "color: gray; font-weight: bold; font-size: 16px;");
                newsContent += `
                    <div class="news-item">
                        <h3>${newsItem.headline}</h3>
                        <p class="news-details">Source: <span class="news-source">${newsItem.source}</span>, Time: <span class="news-time">${newsItem.time}</span>, Sentiment: <span style="${sentimentStyle}">${sentimentScore}</span></p>
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
    sentimentChart = new Chart(document.getElementById('sentiment-bar-chart').getContext('2d'), {
        type: 'bar',
        data: {
            labels: ['Positive', 'Negative', 'Neutral'],
            datasets: [{
                label: 'Sentiment Analysis',
                data: [0, 0, 0],
                backgroundColor: [
                    'rgba(75, 192, 192, 0.7)',
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(255, 206, 86, 0.7)'
                ],
                borderColor: [
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(255, 206, 86, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            maintainAspectRatio: false,
            responsive: true,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Sentiment Analysis',
                    font: {
                        size: 18,
                        weight: 'bold'
                    },
                    padding: 20
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            size: 14
                        }
                    }
                },
                y: {
                    grid: {
                        drawBorder: false,
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        font: {
                            size: 14
                        }
                    }
                }
            }
        }
    });
}
