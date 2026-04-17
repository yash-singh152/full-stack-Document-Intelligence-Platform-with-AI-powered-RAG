import requests
from bs4 import BeautifulSoup
from .models import Book

class BookScraper:
    BASE_URL = "http://books.toscrape.com/"

    def scrape_books(self, limit=10):
        response = requests.get(self.BASE_URL)
        soup = BeautifulSoup(response.content, 'html.parser')
        
        books_data = []
        book_pods = soup.select('.product_pod')[:limit]
        
        for pod in book_pods:
            # Extract title and detail URL
            title_tag = pod.select_one('h3 a')
            title = title_tag['title']
            relative_url = title_tag['href']
            # Correct the relative URL based on structure (if coming from main page)
            if relative_url.startswith('catalogue/'):
                detail_url = self.BASE_URL + relative_url
            else:
                detail_url = self.BASE_URL + 'catalogue/' + relative_url

            # Extract rating
            rating_classes = pod.select_one('.star-rating')['class']
            rating = next((c for c in rating_classes if c != 'star-rating'), "None")

            # Go to detail page for description
            detail_res = requests.get(detail_url)
            detail_soup = BeautifulSoup(detail_res.content, 'html.parser')
            
            # Description is usually the first <p> after #product_description
            desc_header = detail_soup.select_one('#product_description')
            description = desc_header.find_next_sibling('p').text if desc_header else "No description available."

            books_data.append({
                'title': title,
                'url': detail_url,
                'rating': rating,
                'description': description,
                'author': "Unknown"  # Not available on this site as researched
            })

        return books_data

    def save_books(self, books_data):
        saved_books = []
        for data in books_data:
            book, created = Book.objects.get_or_create(
                url=data['url'],
                defaults={
                    'title': data['title'],
                    'rating': data['rating'],
                    'description': data['description'],
                    'author': data['author']
                }
            )
            saved_books.append(book)
        return saved_books
