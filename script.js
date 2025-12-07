document.addEventListener('DOMContentLoaded', () => {
    const navItems = document.querySelectorAll('.nav-item');
    const contentArea = document.getElementById('content-area');
    const darkModeToggle = document.getElementById('darkModeToggle');
    
    // **متغيرات إدارة المنشورات**
    const jobListContainer = document.querySelector('.job-list-container');
    const myPostsContainer = document.querySelector('.my-posts-list-container');
    const publishForm = document.getElementById('publishForm');
    
    // **متغيرات البحث والتصفية**
    const jobCards = jobListContainer ? Array.from(jobListContainer.querySelectorAll('.job-post-card')) : [];
    const filterButtons = document.querySelectorAll('.filter-btn');
    const searchBar = document.getElementById('jobSearchBar');

    // ----------------------------------------------------
    // **وظيفة التبديل بين محتوى الصفحات**
    // ----------------------------------------------------
    const switchPage = (targetContentId, targetNavItem) => {
        navItems.forEach(nav => nav.classList.remove('active'));
        const allContentDivs = document.querySelectorAll('.page-content');
        allContentDivs.forEach(div => div.classList.add('hidden'));

        if(targetNavItem) {
            targetNavItem.classList.add('active');
        } else {
            const navSelector = `a[data-content="${targetContentId.replace('-content', '')}"]`;
            const navElement = document.querySelector(navSelector);
            if(navElement) {
                navElement.classList.add('active');
            }
        }
        
        const targetContent = document.getElementById(targetContentId);
        if (targetContent) {
            targetContent.classList.remove('hidden');
        }
    };
    
    // ربط القائمة الجانبية بوظيفة التبديل
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = item.getAttribute('data-content') + '-content';
            switchPage(targetId, item);
        });
    });

    // ----------------------------------------------------
    // **وظيفة الوضع الليلي (Dark Mode)**
    // ----------------------------------------------------

    const enableDarkMode = (shouldEnable) => {
        if (shouldEnable) {
            document.body.classList.add('dark-mode');
            localStorage.setItem('darkMode', 'enabled');
        } else {
            document.body.classList.remove('dark-mode');
            localStorage.setItem('darkMode', 'disabled');
        }
    };

    if (localStorage.getItem('darkMode') === 'enabled') {
        enableDarkMode(true);
        if(darkModeToggle) {
            darkModeToggle.checked = true;
        }
    } else if (localStorage.getItem('darkMode') === 'disabled') {
        enableDarkMode(false);
        if(darkModeToggle) {
            darkModeToggle.checked = false;
        }
    }

    if (darkModeToggle) {
        darkModeToggle.addEventListener('change', (e) => {
            enableDarkMode(e.target.checked);
        });
    }

    // ------------------------------------------------------------------
    // **دوال إنشاء بطاقات المنشورات**
    // ------------------------------------------------------------------

    const createNewJobPostCard = (data) => {
        let typeClass = '';
        let typeText = '';
        let jobLocationType = ''; // لتصفية الموقع

        if (data.type === 'full-time') {
            typeClass = 'tag-full-time';
            typeText = 'دوام كامل';
        } else if (data.type === 'part-time') {
            typeClass = 'tag-part-time';
            typeText = 'دوام جزئي';
        } else {
            typeClass = 'tag-freelance'; 
            typeText = 'عمل حر';
        }

        // تحديد نوع الموقع للتصفية
        if (data.location.toLowerCase().includes('عن بعد') || data.location.toLowerCase().includes('remote')) {
            jobLocationType = 'remote';
        } else {
            jobLocationType = 'onsite';
        }

        const descriptionHTML = data.description.replace(/\n/g, '<br>');

        const html = `
            <div class="job-post-card" data-job-id="${data.id}" data-job-type="${data.type}" data-job-location="${jobLocationType}">
                <div class="post-header">
                    <h3 class="job-title">${data.title}</h3> 
                    <span class="job-type ${typeClass}">
                        ${typeText}
                    </span>
                </div>
                
                <div class="post-details">
                    <p><i class="fas fa-map-marker-alt"></i> <strong>المكان:</strong> ${data.location}</p> 
                    <p><i class="fas fa-money-bill-wave"></i> <strong>المرتب:</strong> ${data.salary || 'يحدد لاحقاً'}</p> 
                    <p><i class="fas fa-clock"></i> <strong>ساعات العمل:</strong> ${data.hours}</p>
                </div>

                <p class="job-description">
                    <strong>وصف العمل:</strong> ${descriptionHTML}
                </p>
                
                <button class="job-apply-btn primary-btn" data-job-id="${data.id}" data-job-title="${data.title}">
                    <i class="fas fa-paper-plane"></i> تقديم الآن
                </button>
            </div>
        `;
        
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html.trim();
        const newCard = tempDiv.firstChild;
        // تحديث النص القابل للبحث فوراً
        newCard.searchableText = newCard.textContent.toLowerCase();
        jobCards.push(newCard); // إضافة البطاقة الجديدة لمجموعة التصفية
        return newCard;
    };
    
    // ----------------------------------------------------
    // **دالة إنشاء بطاقة لوظائفي المنشورة**
    // ----------------------------------------------------

    const createMyPostCard = (data) => {
        let typeClass = '';
        let typeText = '';

        if (data.type === 'full-time') {
            typeClass = 'tag-full-time';
            typeText = 'دوام كامل';
        } else if (data.type === 'part-time') {
            typeClass = 'tag-part-time';
            typeText = 'دوام جزئي';
        } else {
            typeClass = 'tag-freelance'; 
            typeText = 'عمل حر';
        }

        const descriptionPreview = data.description.substring(0, 100) + (data.description.length > 100 ? '...' : '');

        const html = `
            <div class="job-post-card my-post-card" data-post-id="${data.id}">
                <div class="post-header">
                    <h3 class="job-title">${data.title}</h3> 
                    <span class="job-type ${typeClass}">
                        ${typeText}
                    </span>
                </div>
                
                <p class="job-description-preview">
                    ${descriptionPreview}
                </p>
                
                <div class="post-options-dropdown">
                    <button class="options-btn" data-toggle="dropdown"><i class="fas fa-ellipsis-v"></i></button>
                    
                    <ul class="dropdown-menu">
                        <li>
                            <button class="edit-post-btn" data-job-id="${data.id}" data-job-title="${data.title}">
                                <i class="fas fa-edit"></i> تعديل المنشور
                            </button>
                        </li>
                        <li>
                            <button class="delete-post-btn" data-job-id="${data.id}">
                                <i class="fas fa-trash-alt"></i> حذف المنشور
                            </button>
                        </li>
                        <li>
                            <button class="share-post-btn" data-job-id="${data.id}" data-job-title="${data.title}">
                                <i class="fas fa-share-alt"></i> مشاركة المنشور
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
        `;
        
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html.trim();
        return tempDiv.firstChild;
    };

    // ----------------------------------------------------
    // **وظيفة نشر فرصة عمل**
    // ----------------------------------------------------
    
    if (publishForm) {
        publishForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const newJobData = {
                id: `post-${Date.now()}`,
                title: document.getElementById('jobTitleInput').value.trim(),
                location: document.getElementById('jobLocationInput').value.trim(),
                salary: document.getElementById('jobSalaryInput').value.trim(),
                type: document.getElementById('jobTypeSelect').value,
                hours: document.getElementById('jobHoursInput').value.trim(),
                description: document.getElementById('jobDescriptionInput').value.trim(),
            };
            
            if (!newJobData.title || !newJobData.description) {
                alert('يرجى ملء جميع الحقول المطلوبة.');
                return;
            }

            const newPostCardMain = createNewJobPostCard(newJobData);
            const newPostCardMyPosts = createMyPostCard(newJobData);
            
            if (jobListContainer && newPostCardMain) {
                jobListContainer.prepend(newPostCardMain);
                newPostCardMain.querySelector('.job-apply-btn').addEventListener('click', handleApplyButtonClick);
            }

            if (myPostsContainer && newPostCardMyPosts) {
                const emptyState = myPostsContainer.querySelector('.empty-state');
                if(emptyState) emptyState.remove();

                myPostsContainer.prepend(newPostCardMyPosts);
            }
            
            publishForm.reset(); 
            switchPage('main-content');
            
            alert(`✅ تم نشر وظيفة "${newJobData.title}" بنجاح وتم عرضها في الصفحة الرئيسية ووظائفي المنشورة!`);
        });
    }

    // ----------------------------------------------------
    // **وظيفة زر "تقديم الآن"**
    // ----------------------------------------------------
    const handleApplyButtonClick = (e) => {
        const button = e.currentTarget;
        const jobTitle = button.getAttribute('data-job-title');
        switchPage('chat-content');
        alert(`تم تحويلك إلى صفحة الدردشة لبدء محادثة بخصوص وظيفة: ${jobTitle}.`);
    };

    const applyButtons = document.querySelectorAll('.job-apply-btn');
    applyButtons.forEach(button => {
        button.addEventListener('click', handleApplyButtonClick);
    });
    
    // ----------------------------------------------------
    // **وظيفة التصفية والبحث الديناميكية**
    // ----------------------------------------------------

    // 1. إضافة بيانات إضافية لبطاقات الوظائف الموجودة مسبقًا (للتجربة)
    jobCards.forEach(card => {
        card.searchableText = card.textContent.toLowerCase();
    });

    const applyFilters = () => {
        const activeTypeFilter = document.querySelector('.filter-btn.active[data-filter-type]:not([data-filter-type="remote"]):not([data-filter-type="onsite"]):not([data-filter-type="all"])')?.getAttribute('data-filter-type') || 'all';
        const activeLocationFilter = document.querySelector('.filter-btn.active[data-filter-type="remote"], .filter-btn.active[data-filter-type="onsite"]')?.getAttribute('data-filter-type') || 'all';
        const searchTerm = searchBar.value.toLowerCase().trim();

        jobCards.forEach(card => {
            const jobType = card.getAttribute('data-job-type');
            const jobLocation = card.getAttribute('data-job-location');
            const matchesSearch = card.searchableText.includes(searchTerm);

            const matchesType = (activeTypeFilter === 'all' || jobType === activeTypeFilter);
            const matchesLocation = (activeLocationFilter === 'all' || jobLocation === activeLocationFilter);

            if (matchesSearch && matchesType && matchesLocation) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    };

    // 2. ربط الأحداث (البحث والأزرار)
    if (searchBar) {
        searchBar.addEventListener('input', applyFilters);
    }
    
    if (filterButtons.length > 0) {
        filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const currentFilterType = e.currentTarget.getAttribute('data-filter-type');
                
                // إعادة تعيين أزرار التصفية لتجنب تضارب التفعيل
                if (currentFilterType === 'all') {
                    filterButtons.forEach(btn => btn.classList.remove('active'));
                    e.currentTarget.classList.add('active');
                } else {
                    const isLocationFilter = currentFilterType === 'remote' || currentFilterType === 'onsite';
                    const isTypeFilter = !isLocationFilter && currentFilterType !== 'all';

                    filterButtons.forEach(btn => {
                        const btnType = btn.getAttribute('data-filter-type');
                        const btnIsLocation = btnType === 'remote' || btnType === 'onsite';
                        
                        // إزالة التفعيل من الأزرار المنافسة
                        if ((isLocationFilter && btnIsLocation) || (isTypeFilter && !btnIsLocation && btnType !== 'all')) {
                            btn.classList.remove('active');
                        }
                    });
                    
                    e.currentTarget.classList.add('active');
                    document.querySelector('.filter-btn[data-filter-type="all"]')?.classList.remove('active');
                }
                
                applyFilters();
            });
        });
    }

    // ----------------------------------------------------
    // **وظيفة تمييز الإشعارات كمقروءة**
    // ----------------------------------------------------
    const markReadButtons = document.querySelectorAll('.mark-read-btn');

    markReadButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const card = e.currentTarget.closest('.notification-card');
            if (card) {
                card.classList.remove('unread');
                e.currentTarget.textContent = 'تم القراءة';
                e.currentTarget.disabled = true;
                e.currentTarget.style.opacity = '0.5';
                alert(`✅ تم تمييز الإشعار كمقروء.`);
            }
        });
    });

    // ----------------------------------------------------
    // **وظائف الملف الشخصي (Profile)**
    // ----------------------------------------------------
    const editProfileBtn = document.getElementById('editProfileBtn');
    const saveProfileBtn = document.getElementById('saveProfileBtn');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    const profileFormInputs = document.querySelectorAll('#profileForm input, #profileForm textarea');
    const profileForm = document.getElementById('profileForm');
    const imageUpload = document.getElementById('imageUpload');
    const profileImage = document.getElementById('profileImage');

    if(editProfileBtn){
        editProfileBtn.addEventListener('click', () => {
            profileFormInputs.forEach(input => {
                input.disabled = false;
            });
            imageUpload.disabled = false; // تفعيل رفع الصورة
            editProfileBtn.classList.add('hidden');
            saveProfileBtn.classList.remove('hidden');
            cancelEditBtn.classList.remove('hidden');
        });
    }

    if(cancelEditBtn){
        cancelEditBtn.addEventListener('click', () => {
            profileFormInputs.forEach(input => {
                input.disabled = true;
            });
            imageUpload.disabled = true; // إلغاء تفعيل رفع الصورة
            editProfileBtn.classList.remove('hidden');
            saveProfileBtn.classList.add('hidden');
            cancelEditBtn.classList.add('hidden');
        });
    }

    if(profileForm){
        profileForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('تم حفظ التغييرات بنجاح! (إجراء محاكاة)'); 
            cancelEditBtn.click();
        });
    }

    if(imageUpload){
        imageUpload.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    profileImage.src = e.target.result;
                }
                reader.readAsDataURL(file);
            }
        });
    }

    // ----------------------------------------------------
    // **وظائف التفاعل مع القائمة المنسدلة (Dropdown)**
    // ----------------------------------------------------

    document.addEventListener('click', (e) => {
        // إذا تم الضغط على زر الثلاث نقاط
        if (e.target.closest('.options-btn')) {
            const btn = e.target.closest('.options-btn');
            const dropdown = btn.closest('.post-options-dropdown').querySelector('.dropdown-menu');
            
            document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
                if (menu !== dropdown) {
                    menu.classList.remove('show');
                }
            });

            dropdown.classList.toggle('show');
            e.stopPropagation(); 
        } 
        // إذا تم الضغط في أي مكان آخر، إغلق كل القوائم
        else if (!e.target.closest('.dropdown-menu')) {
             document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
                menu.classList.remove('show');
            });
        }
        
        // **وظيفة حذف المنشور**
        if (e.target.classList.contains('delete-post-btn')) {
            const postId = e.target.getAttribute('data-job-id');
            if (confirm(`هل أنت متأكد من حذف الوظيفة رقم ${postId}؟ سيتم حذفها من جميع الأماكن.`)) {
                
                document.querySelector(`.my-post-card[data-post-id="${postId}"]`)?.remove();
                document.querySelector(`.job-post-card[data-job-id="${postId}"]`)?.remove();

                // تحديث قائمة jobCards لإزالة المنشور المحذوف من التصفية
                const indexToRemove = jobCards.findIndex(card => card.getAttribute('data-job-id') === postId);
                if (indexToRemove !== -1) {
                    jobCards.splice(indexToRemove, 1);
                }

                if (myPostsContainer && myPostsContainer.children.length === 0) {
                     const emptyStateHTML = `<p class="empty-state">سيتم عرض جميع الوظائف التي قمت بنشرها هنا.</p>`;
                     myPostsContainer.innerHTML = emptyStateHTML;
                }
                
                alert('تم حذف المنشور بنجاح.');
            }
             e.target.closest('.dropdown-menu').classList.remove('show');
        }
        
        // **وظيفة تعديل المنشور**
        if (e.target.classList.contains('edit-post-btn')) {
            const jobTitle = e.target.getAttribute('data-job-title');
            alert(`سيتم فتح نموذج التعديل لوظيفة: ${jobTitle}.`);
            e.target.closest('.dropdown-menu').classList.remove('show');
        }
        
        // **وظيفة المشاركة**
        if (e.target.classList.contains('share-post-btn')) {
            const jobTitle = e.target.getAttribute('data-job-title');
            alert(`✅ تم نسخ رابط وظيفة "${jobTitle}" للمشاركة! (محاكاة)`);
            e.target.closest('.dropdown-menu').classList.remove('show');
        }
        
    });
});
// ----------------------------------------------------
    // **تسجيل ملف Service Worker (لتفعيل ميزة PWA)**
    // ----------------------------------------------------
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/service-worker.js').then(registration => {
                console.log('SW registered: ', registration);
            }).catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
        });
    }const urlsToCache = [
    '/index.html', // تم تغيير dashboard.html إلى index.html
    '/style.css',
    '/script.js',
    '/manifest.json',
    // ...
];