// script.js
// using Vanilla JavaScript and fetch API

// check if we are on a form page to avoid errors
document.addEventListener('DOMContentLoaded', () => {
    
    // LOGIN FORM
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const errorMsg = document.getElementById('error-message');
            
            try {
                // fetch call to our backend api!
                const res = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({username, password})
                });
                
                const data = await res.json();
                
                if (res.ok) {
                    window.location.href = '/'; // redirect to dashboard
                } else {
                    errorMsg.textContent = data.error;
                    errorMsg.style.display = 'block';
                }
            } catch (err) {
                console.error("Login failed:", err);
            }
        });
    }

    // REGISTER FORM
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const errorMsg = document.getElementById('error-message');
            const successMsg = document.getElementById('success-message');
            
            try {
                const res = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({username, password})
                });
                
                const data = await res.json();
                
                if (res.ok) {
                    errorMsg.style.display = 'none';
                    successMsg.textContent = "Registered perfectly! You can login now.";
                    successMsg.style.display = 'block';
                    registerForm.reset();
                } else {
                    successMsg.style.display = 'none';
                    errorMsg.textContent = data.error;
                    errorMsg.style.display = 'block';
                }
            } catch (err) {
                console.error("Register failed:", err);
            }
        });
    }

    // DASHBOARD LOGIC
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            await fetch('/api/auth/logout', { method: 'POST' });
            window.location.href = '/login';
        });
    }

    // if we are on dashboard, fetch the links immediately
    const linksContainer = document.getElementById('linksContainer');
    if (linksContainer) {
        
        let allMyLinks = []; // this variable holds the state
        
        // function to grab links from python backend
        const fetchLinks = async () => {
            try {
                const res = await fetch('/api/links');
                allMyLinks = await res.json();
                renderLinks();
                populateTags();
            } catch (err) {
                console.error("Error fetching links", err);
            }
        };

        const renderLinks = () => {
            linksContainer.innerHTML = ''; // clear it out
            
            const searchTerm = document.getElementById('searchBar').value.toLowerCase();
            const tagFilter = document.getElementById('tagFilter').value;
            let displayCount = 0;
            
            // simple filtering loop
            for (let link of allMyLinks) {
                // Check filters
                const matchesSearch = link.title.toLowerCase().includes(searchTerm);
                const matchesTag = tagFilter === "" || link.tag === tagFilter;
                
                if (matchesSearch && matchesTag) {
                    displayCount++;
                    const card = document.createElement('div');
                    card.className = 'link-card';
                    card.innerHTML = `
                        <div class="card-header">
                            <h3>${link.title}</h3>
                            ${link.tag ? `<span class="tag-pill">${link.tag}</span>` : ''}
                        </div>
                        <a href="${link.url}" target="_blank" class="link-url">${link.url}</a>
                        <div class="card-actions">
                            <button class="btn-edit" onclick="openEditModal(${link.id}, '${link.title}', '${link.tag}')">Edit</button>
                            <button class="btn-danger" onclick="deleteLink(${link.id})">Delete</button>
                        </div>
                    `;
                    linksContainer.appendChild(card);
                }
            }
            
            // update the counts
            document.getElementById('link-count').textContent = `You have ${allMyLinks.length} total links saved.`;
            
            if (displayCount === 0) {
                linksContainer.innerHTML = `
                    <div class="empty-state">
                        <p>No links found! 😲</p>
                    </div>`;
            }
        };

        const populateTags = () => {
            const select = document.getElementById('tagFilter');
            const currentVal = select.value;
            select.innerHTML = '<option value="">All Tags</option>';
            
            const uniqueTags = [...new Set(allMyLinks.map(l => l.tag).filter(t => t))];
            
            uniqueTags.forEach(tag => {
                const opt = document.createElement('option');
                opt.value = tag;
                opt.textContent = tag;
                if(tag === currentVal) opt.selected = true;
                select.appendChild(opt);
            });
        };

        // Add form submission
        const addLinkForm = document.getElementById('addLinkForm');
        addLinkForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const title = document.getElementById('title').value;
            const url = document.getElementById('url').value;
            let tag = document.getElementById('tag').value;
            tag = tag.toLowerCase().trim(); // clean it up a bit
            
            try {
                await fetch('/api/links', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({title, url, tag})
                });
                addLinkForm.reset();
                fetchLinks(); // grab the updated list
            } catch (err) {
                console.error("Failed to add link:", err);
            }
        });

        // the global delete function
        window.deleteLink = async (id) => {
            if(confirm("Are you sure you want to delete this resource?")) {
                await fetch(`/api/links/${id}`, { method: 'DELETE' });
                fetchLinks(); // reload to show it's gone
            }
        };

        // Modal Logic
        const modal = document.getElementById('editModal');
        const closeBtn = document.querySelector('.close-btn');
        const editForm = document.getElementById('editLinkForm');

        window.openEditModal = (id, title, tag) => {
            document.getElementById('edit-id').value = id;
            document.getElementById('edit-title').value = title;
            document.getElementById('edit-tag').value = tag !== 'null' ? tag : '';
            modal.style.display = "block";
        };

        closeBtn.onclick = () => { modal.style.display = "none"; };
        window.onclick = (e) => { if (e.target == modal) { modal.style.display = "none"; } };

        editForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('edit-id').value;
            const title = document.getElementById('edit-title').value;
            let tag = document.getElementById('edit-tag').value;
            tag = tag.toLowerCase().trim();

            await fetch(`/api/links/${id}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({title, tag})
            });
            
            modal.style.display = "none";
            fetchLinks();
        });

        // setup event listeners for search and filter
        document.getElementById('searchBar').addEventListener('input', renderLinks);
        document.getElementById('tagFilter').addEventListener('change', renderLinks);

        // run it when page loads!
        fetchLinks();
    }
});
