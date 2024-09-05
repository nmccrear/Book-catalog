document.addEventListener('DOMContentLoaded', function () {
    const modal = document.getElementById('book-form-modal');
    const addBookBtn = document.getElementById('add-book-btn');
    const closeModal = document.querySelector('.close');
    const form = document.getElementById('book-form');
    const bookList = document.getElementById('book-list');
    const searchBar = document.getElementById('search-bar');
    const searchBtn = document.getElementById('search-btn');
    let books = [];

    // Function to load books from Firestore
    function loadBooks() {
        db.collection("books").get().then((querySnapshot) => {
            books = [];
            querySnapshot.forEach((doc) => {
                books.push({ id: doc.id, ...doc.data() });
            });
            displayBooks([]); // Display nothing initially
        });
    }

    // Function to save a book to Firestore
    function saveBookToFirestore(book) {
        return db.collection("books").add(book);
    }

    // Function to update a book in Firestore
    function updateBookInFirestore(id, updatedBook) {
        return db.collection("books").doc(id).update(updatedBook);
    }

    // Function to display books
    function displayBooks(filteredBooks = []) {
        bookList.innerHTML = ''; // Clear the list

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
        form.reset();
        document.getElementById('modal-title').textContent = 'Add New Book';
        modal.style.display = 'flex';
    });

    // Close the modal when the "x" is clicked
    closeModal.addEventListener('click', function () {
        modal.style.display = 'none';
    });

    // Add/Edit book form submission
    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const bookData = {
            title: document.getElementById('title').value,
            author: document.getElementById('author').value,
            isbn: document.getElementById('isbn').value,
            genre: document.getElementById('genre').value,
            description: document.getElementById('description').value,
            cover: document.getElementById('cover').value
        };

        if (editingBookIndex !== null) {
            // Update the book in Firestore
            const bookId = books[editingBookIndex].id;
            updateBookInFirestore(bookId, bookData).then(() => {
                loadBooks(); // Refresh the list
            });
        } else {
            // Add a new book
            saveBookToFirestore(bookData).then(() => {
                loadBooks(); // Refresh the list
            });
        }

        modal.style.display = 'none'; // Close the modal
    });

    // Search functionality (triggered only on button click)
    searchBtn.addEventListener('click', function () {
        const searchTerm = searchBar.value.toLowerCase();
        if (searchTerm === '') {
            displayBooks([]); // If search bar is empty, don't show any books
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

    // Initial load of books
    loadBooks();
});
