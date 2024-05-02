# app.py
from flask import Flask, render_template, jsonify, request
import joblib
import requests
from bs4 import BeautifulSoup
import time
import pandas as pd
from preprocess import preprocess_text 



app = Flask(__name__)

# Load the SVM model and its associated components
model_data = joblib.load('svm_model.pkl')
svm_model = model_data['svm_model']
tfidf_vectorizer = model_data['tfidf_vectorizer']

# Function to preprocess text using the loaded preprocess_text function
def preprocess_input_text(text):
    return preprocess_text(text)

# Function to make predictions using the loaded SVM model and TF-IDF vectorizer
def predict_sentiment(text):
    preprocessed_text = preprocess_input_text(text)
    # Transform the preprocessed text using the TF-IDF vectorizer
    text_tfidf = tfidf_vectorizer.transform([preprocessed_text])
    # Make predictions using the SVM model
    prediction = svm_model.predict(text_tfidf)
    return prediction[0]

# Route to predict sentiment for scraped news headlines
@app.route('/predict_sentiment', methods=['POST'])
def predict_sentiment_for_news():
    # Receive scraped news headlines from the request
    news_headlines = request.json.get('news_headlines', [])
    
    # Predict sentiment for each news headline
    sentiment_predictions = [predict_sentiment(headline) for headline in news_headlines]
    
    # Convert sentiment predictions to a JSON serializable format

    sentiment_predictions = [int(pred) for pred in sentiment_predictions]
    # Count the number of positive, negative, and neutral sentiments
    positive_count = sentiment_predictions.count(1)
    negative_count = sentiment_predictions.count(0)
    neutral_count = sentiment_predictions.count(2)
    
    return jsonify({'sentiment_predictions': sentiment_predictions, 'positive_count': positive_count, 'negative_count': negative_count, 'neutral_count': neutral_count})


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

   # Find news headlines, sources, and times from both sections
    news_data = []
    news_sections = soup.find_all('div', class_='Yfwt5')  # News sections
    top_news_sections = soup.find_all('div', class_='F2KAFc')  # Top news sections

    # Extract news from news sections
    for news_section in news_sections:
        headline = str(news_section.text.strip()) 
        parent_div = news_section.parent
        source_element = parent_div.find_next(class_='sfyJob')
        time_element = parent_div.find_next(class_='Adak')
        if source_element and time_element:
            source = source_element.text.strip()
            time = time_element.text.strip()
            news_data.append({'headline': headline, 'source': source, 'time': time})

    # Extract news from top news sections
    for top_news_section in top_news_sections:
        headline = str(top_news_section.text.strip())
        source_element = top_news_section.find_next(class_='AYBNIb')
        time_element = top_news_section.find_next(class_='HzW5e')
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
            sentiment_scores = [predict_sentiment(headline['headline']) for headline in news_headlines]
            for i, headline in enumerate(news_headlines):
                headline['sentiment_score'] = int(sentiment_scores[i])  # Convert to int here
            return jsonify({'company': company, 'price': price, 'news_headlines': news_headlines})
        else:
            return jsonify({'error': 'Price URL not found'})
    else:
        return jsonify({'error': 'Company not found'})


if __name__ == '__main__':
    app.run(debug=True)
