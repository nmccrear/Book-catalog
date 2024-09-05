document.addEventListener('DOMContentLoaded', function () {
    const modal = document.getElementById('book-form-modal');
    const addBookBtn = document.getElementById('add-book-btn');
    const closeModal = document.querySelector('.close');
    const form = document.getElementById('book-form');
    const bookList = document.getElementById('book-list');
    const searchBar = document.getElementById('search-bar');
    let books = [];
    let editingBookIndex = null;

    // Function to display books
    function displayBooks(filteredBooks = []) {
        bookList.innerHTML = ''; // Clear the list

        // If no books are found and the search bar is not empty, show "No results found."
        if (filteredBooks.length === 0 && searchBar.value.trim() !== '') {
            const noResults = document.createElement('p');
            noResults.textContent = 'No results found.';
            bookList.appendChild(noResults);
        } else {
            filteredBooks.forEach((book, index) => {
                const bookItem = document.createElement('div');
                bookItem.classList.add('book-item');
                
                bookItem.innerHTML = `
                    <img src="${book.cover || 'cover.jpg'}" alt="Book Cover" class="book-cover">
                    <div class="book-info">
                        <h2>${book.title}</h2>
                        <p><strong>Author:</strong> ${book.author}</p>
                        <p><strong>Genre:</strong> ${book.genre}</p>
                        <p><strong>Description:</strong> ${book.description}</p>
                        <p><strong>ISBN:</strong> ${book.isbn}</p>
                        <button class="edit-book-btn" data-index="${index}">Edit</button>
                    </div>
                `;
                bookList.appendChild(bookItem);
            });

            // Add event listeners to all "Edit" buttons
            const editButtons = document.querySelectorAll('.edit-book-btn');
            editButtons.forEach(button => {
                button.addEventListener('click', function () {
                    const bookIndex = button.getAttribute('data-index');
                    editBook(bookIndex);
                });
            });
        }
    }

    // Function to open the modal for editing a book
    function editBook(index) {
        editingBookIndex = index;
        const book = books[index];
        document.getElementById('title').value = book.title;
        document.getElementById('author').value = book.author;
        document.getElementById('isbn').value = book.isbn;
        document.getElementById('genre').value = book.genre;
        document.getElementById('description').value = book.description;
        document.getElementById('cover').value = book.cover;
        document.getElementById('modal-title').textContent = 'Edit Book';
        modal.style.display = 'flex';
    }

    // Show the modal when "Add New Book" is clicked
    addBookBtn.addEventListener('click', function () {
        editingBookIndex = null; // Set to null when adding a new book
        form.reset(); // Clear the form
        document.getElementById('modal-title').textContent = 'Add New Book';
        modal.style.display = 'flex'; // Ensure the modal shows
    });

    // Close the modal when the "x" is clicked
    closeModal.addEventListener('click', function () {
        modal.style.display = 'none';
    });

    // Close the modal when clicking outside of it
    window.addEventListener('click', function (e) {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Add/Edit book form submission
    form.addEventListener('submit', function (e) {
        e.preventDefault(); // Prevent form from reloading the page

        const bookData = {
            title: document.getElementById('title').value,
            author: document.getElementById('author').value,
            isbn: document.getElementById('isbn').value,
            genre: document.getElementById('genre').value,
            description: document.getElementById('description').value,
            cover: document.getElementById('cover').value
        };

        if (editingBookIndex !== null) {
            // Update an existing book
            books[editingBookIndex] = bookData;
        } else {
            // Add a new book
            books.push(bookData);
        }

        modal.style.display = 'none'; // Close the modal after saving
        searchBar.value = '';  // Clear the search bar after adding a book
        displayBooks([]); // Ensure no books are displayed until searched
    });

    // Search functionality
    searchBar.addEventListener('input', function () {
        const searchTerm = searchBar.value.toLowerCase();

        if (searchTerm === '') {
            // If search bar is empty, don't show any books
            displayBooks([]);
        } else {
            const filteredBooks = books.filter(book => {
                return (
                    book.title.toLowerCase().includes(searchTerm) ||
                    book.author.toLowerCase().includes(searchTerm) ||
                    book.isbn.toLowerCase().includes(searchTerm)
                );
            });
            displayBooks(filteredBooks);
        }
    });

    // Initial display (empty book list on page load)
    displayBooks([]);
});