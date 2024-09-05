document.addEventListener('DOMContentLoaded', function () {
    const modal = document.getElementById('book-form-modal');
    const addBookBtn = document.getElementById('add-book-btn');
    const closeModal = document.querySelector('.close');
    const form = document.getElementById('book-form');
    const deleteBtn = document.getElementById('delete-book-btn');
    const bookList = document.getElementById('book-list');
    const searchBar = document.getElementById('search-bar');
    let books = [];
    let editingBookIndex = null;

    // Function to escape user inputs to prevent XSS
    function escapeHTML(str) {
        return str.replace(/&/g, '&amp;')
                  .replace(/</g, '&lt;')
                  .replace(/>/g, '&gt;')
                  .replace(/"/g, '&quot;')
                  .replace(/'/g, '&#039;');
    }

	// Your web app's Firebase configuration (you should replace this with your actual Firebase configuration)
        var firebaseConfig = {
            apiKey: "AIzaSyBxt2-O5UdOmmyvAbk3_LVRP7ulGvJOGoM",
            authDomain: "book-catalog-39f2b.firebaseapp.com",
            projectId: "book-catalog-39f2b",
            storageBucket: "book-catalog-39f2b.appspot.com",
            messagingSenderId: "610607159158",
            appId: "1:610607159158:web:dc0050120cac1a0e370c57",
            measurementId: "G-3M9KWMRPD9"
        };
        // Initialize Firebase
        firebase.initializeApp(firebaseConfig);
  
        // Initialize Firestore
        var db = firebase.firestore();

    // Function to load books from Firestore
    function loadBooks() {
        db.collection("books").get().then((querySnapshot) => {
            books = [];
            querySnapshot.forEach((doc) => {
                books.push({ id: doc.id, ...doc.data() });
            });
            displayBooks([]); // Hide books initially
        }).catch((error) => {
            console.error("Error loading books: ", error);
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

    // Function to delete a book from Firestore
    function deleteBookFromFirestore(id) {
        return db.collection("books").doc(id).delete();
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
                    <img src="${escapeHTML(book.cover) || 'cover.jpg'}" alt="Book Cover" class="book-cover">
                    <div class="book-info">
                        <h2>${escapeHTML(book.title)}</h2>
                        <p><strong>Author:</strong> ${escapeHTML(book.author)}</p>
                        <p><strong>Genre:</strong> ${escapeHTML(book.genre)}</p>
                        <p><strong>Description:</strong> ${escapeHTML(book.description)}</p>
                        <p><strong>ISBN:</strong> ${escapeHTML(book.isbn)}</p>
                        ${book.read ? '<p><strong>Status:</strong> Read</p>' : ''}
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
        editingBookIndex = index;
        const book = books[index];
        document.getElementById('title').value = book.title;
        document.getElementById('author').value = book.author;
        document.getElementById('isbn').value = book.isbn;
        document.getElementById('genre').value = book.genre;
        document.getElementById('description').value = book.description;
        document.getElementById('cover').value = book.cover;
        document.getElementById('read-checkbox').checked = book.read || false;
        document.getElementById('modal-title').textContent = 'Edit Book';
        deleteBtn.style.display = 'inline';
        modal.style.display = 'flex';
    }

    // Show the modal when "Add New Book" is clicked
    addBookBtn.addEventListener('click', function () {
        editingBookIndex = null;
        form.reset();
        document.getElementById('modal-title').textContent = 'Add New Book';
        deleteBtn.style.display = 'none';
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
            title: escapeHTML(document.getElementById('title').value),
            author: escapeHTML(document.getElementById('author').value),
            isbn: escapeHTML(document.getElementById('isbn').value),
            genre: escapeHTML(document.getElementById('genre').value),
            description: escapeHTML(document.getElementById('description').value),
            cover: escapeHTML(document.getElementById('cover').value),
            read: document.getElementById('read-checkbox').checked
        };

        if (editingBookIndex !== null) {
            const bookId = books[editingBookIndex].id;
            updateBookInFirestore(bookId, bookData).then(() => {
                loadBooks();
            });
        } else {
            saveBookToFirestore(bookData).then(() => {
                loadBooks();
            });
        }

        modal.style.display = 'none';
    });

    // Delete book when delete button is clicked
    deleteBtn.addEventListener('click', function () {
        if (editingBookIndex !== null) {
            const bookId = books[editingBookIndex].id;
            deleteBookFromFirestore(bookId).then(() => {
                loadBooks();
                modal.style.display = 'none';
            });
        }
    });

    // Dynamic search functionality
    searchBar.addEventListener('input', function () {
        const searchTerm = searchBar.value.toLowerCase();
        if (searchTerm === '') {
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

    // Initial load of books from Firestore
    loadBooks();
});
