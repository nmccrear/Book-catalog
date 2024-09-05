document.addEventListener('DOMContentLoaded', function () {
    const modal = document.getElementById('book-form-modal');
    const addBookBtn = document.getElementById('add-book-btn');
    const closeModal = document.querySelector('.close');
    const form = document.getElementById('book-form');
    const bookList = document.getElementById('book-list');
    const searchBar = document.getElementById('search-bar');
    let books = [];
    let editingBookIndex = null; // Ensure this is properly initialized

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
            displayBooks(books); // Display all books initially
        }).catch((error) => {
            console.error("Error loading books: ", error);
        });
    }

    // Function to save a book to Firestore
    function saveBookToFirestore(book) {
        return db.collection("books").add(book).then((docRef) => {
            console.log("Document written with ID: ", docRef.id);
        }).catch((error) => {
            console.error("Error adding book: ", error);
        });
    }

    // Function to update a book in Firestore
    function updateBookInFirestore(id, updatedBook) {
        return db.collection("books").doc(id).update(updatedBook).then(() => {
            console.log("Document successfully updated!");
        }).catch((error) => {
            console.error("Error updating book: ", error);
        });
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
        editingBookIndex = index; // Set the editing book index
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
        editingBookIndex = null; // Reset editingBookIndex when adding new book
        form.reset(); // Clear the form
        document.getElementById('modal-title').textContent = 'Add New Book';
        modal.style.display = 'flex';
    });

    // Close the modal when the "x" is clicked
    closeModal.addEventListener('click', function () {
        modal.style.display = 'none';
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

        console.log("Form submitted, book data:", bookData); // Debugging

        if (editingBookIndex !== null) {
            // Update the book in Firestore
            const bookId = books[editingBookIndex].id;
            updateBookInFirestore(bookId, bookData).then(() => {
                loadBooks(); // Refresh the list
                console.log("Book updated successfully"); // Debugging
            });
        } else {
            // Add a new book
            saveBookToFirestore(bookData).then(() => {
                loadBooks(); // Refresh the list
                console.log("Book added successfully"); // Debugging
            });
        }

        modal.style.display = 'none'; // Close the modal
    });

    // Dynamic search functionality
    searchBar.addEventListener('input', function () {
        const searchTerm = searchBar.value.toLowerCase();
        if (searchTerm === '') {
            displayBooks(books); // If search bar is empty, display all books
        } else {
            const filteredBooks = books.filter(book => {
                return (
                    book.title.toLowerCase().includes(searchTerm) ||
                    book.author.toLowerCase().includes(searchTerm) ||
                    book.isbn.toLowerCase().includes(searchTerm)
                );
            });
            displayBooks(filteredBooks); // Display filtered books
        }
    });

    // Initial load of books from Firestore
    loadBooks();
});
