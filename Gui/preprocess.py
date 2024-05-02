from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from nltk.stem import PorterStemmer
import string
import logging

# Initialize NLTK resources
stop_words = set(stopwords.words('english'))
stemmer = PorterStemmer()

# Function to preprocess text
def preprocess_text(text):
    logging.info(f'Text type: {type(text)}, Text value: {text}')
     # Convert input text to string
    text = str(text)

    tokens = word_tokenize(text)
    tokens = [token.lower() for token in tokens]
    tokens = [token for token in tokens if token not in stop_words and token not in string.punctuation]
    tokens = [stemmer.stem(token) for token in tokens]
    return ' '.join(tokens)
