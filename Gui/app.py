# app.py
from flask import Flask, render_template, jsonify, request
import requests
from bs4 import BeautifulSoup
import time


app = Flask(__name__)

# Dictionary to store company names and their corresponding URLs
company_urls = {
    "HDFC Bank Ltd": "https://www.google.com/finance/quote/HDFCBANK:NSE",
    "State Bank of India": "https://www.google.com/finance/quote/SBIN:NSE",
    "ICICI Bank Ltd": "https://www.google.com/finance/quote/ICICIBANK:NSE",
    "Axis Bank Ltd": "https://www.google.com/finance/quote/AXISBANK:NSE"
}

# Function to scrape stock price and graph URL from URL
def scrape_stock_data(url):
    # Send request to the URL
    response = requests.get(url)
    # Parse HTML content
    soup = BeautifulSoup(response.content, 'html.parser')

    # Find the element containing the stock price
    price_element = soup.find('div', class_='YMlKec fxKbKc')
    # Find the element containing the graph URL
    graph_element = soup.find('div', class_='ushogf')

    # Extract and return the stock price and graph URL
    if price_element:
        price = price_element.text.strip()
    else:
        price = "Price not found"
    
    if graph_element:
        graph_url = graph_element.find('img')['src']
    else:
        graph_url = None

    return price, graph_url

# Route to render the HTML template
@app.route('/')
def index():
    return render_template('index.html')

# Route to fetch dynamic stock price and graph URL for a specific company
@app.route('/get_stock_data/<company>')
def get_stock_data(company):
    if company in company_urls:
        url = company_urls[company]
        price, graph_url = scrape_stock_data(url)
        if graph_url:
            return jsonify({'company': company, 'price': price, 'graph': graph_url})
        else:
            return jsonify({'error': 'Graph URL not found'})
    else:
        return jsonify({'error': 'Company not found'})


if __name__ == '__main__':
    app.run(debug=True)
