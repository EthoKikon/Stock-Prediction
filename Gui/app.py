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

    # Extract and return the stock price and graph URL
    if price_element:
        price = price_element.text.strip()
    else:
        price = "Price not found"

   # Find news headlines, sources, and times
    news_data = []
    news_elements = soup.find_all('div', class_='Yfwt5')
    for news_element in news_elements:
        headline = news_element.text.strip()
        parent_div = news_element.parent
        source_element = parent_div.find_next(class_='sfyJob')
        time_element = parent_div.find_next(class_='Adak')
        if source_element and time_element:
            source = source_element.text.strip()
            time = time_element.text.strip()
            news_data.append({'headline': headline, 'source': source, 'time': time})

    return price, news_data

# Route to render the HTML template
@app.route('/')
def index():
    return render_template('index.html')

# Route to fetch dynamic stock price and graph URL for a specific company
@app.route('/get_stock_data/<company>')
def get_stock_data(company):
    if company in company_urls:
        url = company_urls[company]
        price, news_headlines = scrape_stock_data(url)
        if price:
            return jsonify({'company': company, 'price': price, 'news_headlines': news_headlines})
        else:
            return jsonify({'error': 'Price URL not found'})
    else:
        return jsonify({'error': 'Company not found'})


if __name__ == '__main__':
    app.run(debug=True)
