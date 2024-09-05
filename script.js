document.addEventListener('DOMContentLoaded', function () {
    const modal = document.getElementById('book-form-modal');
    const addBookBtn = document.getElementById('add-book-btn');
    const closeModal = document.querySelector('.close');
    const form = document.getElementById('book-form');
    const deleteBtn = document.getElementById('delete-book-btn'); // Button for deleting a book
    const bookList = document.getElementById('book-list');
    const searchBar = document.getElementById('search-bar');
    
    // Login-specific elements
    const loginForm = document.getElementById('login-form');
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const loginModal = document.getElementById('login-form-modal');

    let books = [];
    let currentEditingBookId = null; // Track which book is being edited by its Firestore document ID

    // Firebase configuration (replace with your actual Firebase config)
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
    
    // Initialize Firestore and Auth
    var db = firebase.firestore();
    var auth = firebase.auth(); 

    // Show login modal when the "Login" button is clicked
    loginBtn.addEventListener('click', function() {
        loginModal.style.display = 'block';
        console.log("Login button clicked, modal opened");
    });

    // Firebase Auth State Change Listener
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            console.log('User logged in: ', user.email);
            // Hide login, show logout, and load books
            loginBtn.style.display = 'none';
            logoutBtn.style.display = 'inline';
            loadBooks(); // Only load books if logged in
        } else {
            console.log('User logged out');
            // Show login, hide logout
            loginBtn.style.display = 'inline';
            logoutBtn.style.display = 'none';
            bookList.innerHTML = ''; // Clear book list if logged out
        }
    });

    // Handle Login Form Submission
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        console.log("Attempting to log in with email: ", email);

        firebase.auth().signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                console.log('Logged in successfully');
                loginModal.style.display = 'none'; // Close the login modal
            })
            .catch((error) => {
                console.error('Login failed: ', error.message);
            });
    });

    // Handle Logout
    logoutBtn.addEventListener('click', function() {
        firebase.auth().signOut().then(() => {
            console.log('Logged out successfully');
        }).catch((error) => {
            console.error('Logout failed: ', error.message);
        });
    });

    // Close login modal if clicked outside of it (optional)
    window.addEventListener('click', function(event) {
        if (event.target == loginModal) {
            loginModal.style.display = 'none';
        }
    });

    // Function to load books from Firestore
    function loadBooks() {
        const user = firebase.auth().currentUser;
        if (user) {
            db.collection("books").get().then((querySnapshot) => {
                books = [];
                querySnapshot.forEach((doc) => {
                    books.push({ id: doc.id, ...doc.data() });
                });
                displayBooks([]); // Hide books initially
            }).catch((error) => {
                console.error("Error loading books: ", error);
            });
        } else {
            console.log('User not logged in');
        }
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

    // Function to display books (update to use document ID)
    function displayBooks(filteredBooks = []) {
        bookList.innerHTML = ''; // Clear the list

        if (filteredBooks.length === 0 && searchBar.value.trim() !== '') {
            const noResults = document.createElement('p');
            noResults.textContent = 'No results found.';
            bookList.appendChild(noResults);
        } else {
            filteredBooks.forEach((book) => {
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
                        ${book.read ? '<p><strong>Status:</strong> Read</p>' : ''}
                        <button class="edit-book-btn" data-id="${book.id}">Edit</button> <!-- Attach book ID here -->
                    </div>
                `;
                bookList.appendChild(bookItem);
            });

            // Attach event listeners to the edit buttons
            const editButtons = document.querySelectorAll('.edit-book-btn');
            editButtons.forEach(button => {
                button.addEventListener('click', function () {
                    const bookId = button.getAttribute('data-id'); // Get the Firestore document ID
                    editBook(bookId); // Pass document ID to the edit function
                });
            });
        }
    }

    // Function to open the modal for editing a book using Firestore document ID
    function editBook(bookId) {
        currentEditingBookId = bookId; // Set the current editing book's ID
        const book = books.find(book => book.id === bookId); // Find the correct book by its ID
        if (book) {
            document.getElementById('title').value = book.title;
            document.getElementById('author').value = book.author;
            document.getElementById('isbn').value = book.isbn;
            document.getElementById('genre').value = book.genre;
            document.getElementById('description').value = book.description;
            document.getElementById('cover').value = book.cover;
            document.getElementById('read-checkbox').checked = book.read || false;
            document.getElementById('modal-title').textContent = 'Edit Book';
            deleteBtn.style.display = 'inline'; // Show delete button when editing
            modal.style.display = 'flex'; // Open the modal
            console.log("Edit book modal opened for book ID:", bookId);
        }
    }

    // Show the modal when "Add New Book" is clicked
    addBookBtn.addEventListener('click', function () {
        currentEditingBookId = null; // Reset currentEditingBookId when adding new book
        form.reset(); // Clear the form
        document.getElementById('modal-title').textContent = 'Add New Book';
        deleteBtn.style.display = 'none'; // Hide delete button for new books
        modal.style.display = 'flex'; // Open the modal
        console.log("Add new book modal opened");
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
            cover: document.getElementById('cover').value,
            read: document.getElementById('read-checkbox').checked
        };

        console.log("Form submitted, book data:", bookData);

        if (currentEditingBookId !== null) {
            updateBookInFirestore(currentEditingBookId, bookData).then(() => {
                loadBooks(); // Refresh the list after updating
            });
        } else {
            saveBookToFirestore(bookData).then(() => {
                loadBooks(); // Refresh the list after adding
            });
        }

        modal.style.display = 'none'; // Close the modal
    });

    // Delete book when delete button is clicked
    deleteBtn.addEventListener('click', function () {
        if (currentEditingBookId !== null) {
            deleteBookFromFirestore(currentEditingBookId).then(() => {
                loadBooks(); // Refresh the list after deletion
                modal.style.display = 'none'; // Close the modal after deletion
            });
        }
    });

    // Dynamic search functionality
    searchBar.addEventListener('input', function () {
        const searchTerm = searchBar.value.toLowerCase();
        if (searchTerm === '') {
            displayBooks([]); // Hide all books if search bar is empty
        } else {
            const filteredBooks = books.filter(book => {
                return (
                    book.title.toLowerCase().includes(searchTerm) ||
                    book.author.toLowerCase().includes(searchTerm) ||
                    book.isbn.toLowerCase().includes(searchTerm)
                );
            });
            displayBooks(filteredBooks); // Show filtered books
        }
    });

    // Initial load of books from Firestore
    loadBooks();
});
