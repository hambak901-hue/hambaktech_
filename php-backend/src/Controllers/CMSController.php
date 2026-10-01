<?php
declare(strict_types=1);

namespace HambakTech\Controllers;

use HambakTech\Config\Database;
use HambakTech\Utils\Response;
use PDO;

class CMSController extends BaseController
{
    private const DEFAULT_ANNOUNCEMENTS = [
        [
            'id'        => 'ann-1',
            'title'     => 'Free BVN - NIN Harmonization Check Weekend',
            'message'   => 'Visit our Lakowe centre this Saturday for free BVN-NIN validation guidance and advisory services.',
            'category'  => 'PROMOTION',
            'isActive'  => true,
            'createdAt' => '2026-09-10T08:00:00Z',
        ],
        [
            'id'        => 'ann-2',
            'title'     => 'MTN & Airtel VTU API Maintenance Window',
            'message'   => 'Scheduled upstream telco provider maintenance on Sunday midnight (01:00 AM - 03:00 AM). Airtime vending may experience brief delays.',
            'category'  => 'SYSTEM',
            'isActive'  => true,
            'createdAt' => '2026-09-12T10:00:00Z',
        ],
        [
            'id'        => 'ann-3',
            'title'     => 'Cyber Cafe Tech Academy October Cohort Open',
            'message'   => 'Registrations are now open for Computer Appreciation and Web Development courses. Limited seats available in Ibeju-Lekki.',
            'category'  => 'ACADEMY',
            'isActive'  => true,
            'createdAt' => '2026-09-13T14:30:00Z',
        ]
    ];

    private const DEFAULT_PAGES = [
        [
            'id'              => 'page-1',
            'slug'            => 'terms',
            'title'           => 'Terms of Service & Service Delivery Agreement',
            'metaDescription' => 'Terms governing digital identity services, document processing, and wallet transactions at HAMBakTECH.',
            'published'       => true,
            'updatedAt'       => '2026-09-01T10:00:00Z',
        ],
        [
            'id'              => 'page-2',
            'slug'            => 'privacy',
            'title'           => 'Privacy Policy & Data Protection (NDPR / NDPA 2023)',
            'metaDescription' => 'Our legal commitment to safeguarding personal data in compliance with Nigerian Data Protection Act 2023.',
            'published'       => true,
            'updatedAt'       => '2026-09-01T10:00:00Z',
        ],
        [
            'id'              => 'page-3',
            'slug'            => 'about',
            'title'           => 'About HAMBakTECH Enterprise - Lakowe, Ibeju-Lekki',
            'metaDescription' => 'Leading CAC registration, NIN enrollment, and cyber services centre in Ibeju-Lekki, Lagos State.',
            'published'       => true,
            'updatedAt'       => '2026-09-05T12:00:00Z',
        ]
    ];

    private const DEFAULT_POSTS = [
        [
            'id'          => 'post-1',
            'slug'        => 'cac-business-name-registration-step-by-step-guide',
            'title'       => 'Complete Guide to Registering Your Business Name with CAC in Nigeria (2026)',
            'summary'     => 'Avoid common name reservation pitfalls. Learn the exact documents, fees, and timelines required for seamless CAC approval.',
            'category'    => 'Corporate Affairs',
            'author'      => 'Hambak Legal & Enterprise Desk',
            'publishedAt' => '2026-09-08T09:00:00Z',
            'featured'    => true,
        ],
        [
            'id'          => 'post-2',
            'slug'        => 'nin-card-printing-and-slip-retrieval-guide',
            'title'       => 'How to Retrieve Your Lost NIN Slip and Get a Durable PVC Plastic Card',
            'summary'     => 'Protect your National Identification Number with high-grade PVC card lamination compliant with NIMC standards.',
            'category'    => 'Identity Systems',
            'author'      => 'Hammed Bakare',
            'publishedAt' => '2026-09-05T14:30:00Z',
            'featured'    => false,
        ],
        [
            'id'          => 'post-3',
            'slug'        => 'why-ibeju-lekki-youth-are-learning-web-development',
            'title'       => 'Tech Skills for the Future: Web Development & Office Automation in Ibeju-Lekki',
            'summary'     => 'How our vocational curriculum prepares students for digital enterprise and freelance work.',
            'category'    => 'Academy & Tech',
            'author'      => 'Engr. Emeka Nwosu',
            'publishedAt' => '2026-09-01T11:00:00Z',
            'featured'    => false,
        ]
    ];

    private function getItems(string $key, array $default): array
    {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("SELECT `value` FROM system_settings WHERE `key` = ? LIMIT 1");
        $stmt->execute([$key]);
        $val = $stmt->fetchColumn();

        if ($val === false || $val === null || $val === '') {
            $this->saveItems($key, $default);
            return $default;
        }

        $decoded = json_decode((string)$val, true);
        return is_array($decoded) ? $decoded : $default;
    }

    private function saveItems(string $key, array $items): void
    {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("
            INSERT INTO system_settings (`key`, `value`, `description`, `updated_at`)
            VALUES (?, ?, 'CMS persistent data store', NOW())
            ON DUPLICATE KEY UPDATE `value` = VALUES(`value`), `updated_at` = NOW()
        ");
        $stmt->execute([$key, json_encode($items)]);
    }

    public function getAll(): void
    {
        Response::success([
            'announcements' => $this->getItems('cms_announcements', self::DEFAULT_ANNOUNCEMENTS),
            'pages'         => $this->getItems('cms_pages', self::DEFAULT_PAGES),
            'posts'         => $this->getItems('cms_posts', self::DEFAULT_POSTS),
        ], 'CMS records retrieved.');
    }

    // --- ANNOUNCEMENTS ---

    public function listAnnouncements(): void
    {
        $items = $this->getItems('cms_announcements', self::DEFAULT_ANNOUNCEMENTS);
        Response::success($items, 'Announcements retrieved.');
    }

    public function createAnnouncement(): void
    {
        $this->requireRoles(['super_admin', 'admin']);
        $body = $this->getJsonBody();

        $title = trim((string)($body['title'] ?? ''));
        $message = trim((string)($body['message'] ?? ''));
        $category = strtoupper(trim((string)($body['category'] ?? 'GENERAL')));
        $isActive = (bool)($body['isActive'] ?? true);

        if (empty($title) || empty($message)) {
            Response::error('Title and message are required.', 400);
            return;
        }

        $items = $this->getItems('cms_announcements', self::DEFAULT_ANNOUNCEMENTS);
        $newAnn = [
            'id'        => 'ann-' . bin2hex(random_bytes(6)),
            'title'     => $title,
            'message'   => $message,
            'category'  => $category,
            'isActive'  => $isActive,
            'createdAt' => date('c'),
        ];
        array_unshift($items, $newAnn);
        $this->saveItems('cms_announcements', $items);

        Response::success($newAnn, 'Announcement created successfully.', 201);
    }

    public function updateAnnouncement(array $params): void
    {
        $this->requireRoles(['super_admin', 'admin']);
        $id = $params['id'] ?? '';
        $body = $this->getJsonBody();

        $items = $this->getItems('cms_announcements', self::DEFAULT_ANNOUNCEMENTS);
        $updated = null;

        foreach ($items as &$item) {
            if ($item['id'] === $id) {
                if (isset($body['title'])) $item['title'] = trim((string)$body['title']);
                if (isset($body['message'])) $item['message'] = trim((string)$body['message']);
                if (isset($body['category'])) $item['category'] = strtoupper(trim((string)$body['category']));
                if (isset($body['isActive'])) $item['isActive'] = (bool)$body['isActive'];
                $updated = $item;
                break;
            }
        }

        if (!$updated) {
            Response::notFound('Announcement not found.');
            return;
        }

        $this->saveItems('cms_announcements', $items);
        Response::success($updated, 'Announcement updated successfully.');
    }

    public function deleteAnnouncement(array $params): void
    {
        $this->requireRoles(['super_admin', 'admin']);
        $id = $params['id'] ?? '';

        $items = $this->getItems('cms_announcements', self::DEFAULT_ANNOUNCEMENTS);
        $filtered = array_values(array_filter($items, fn($a) => $a['id'] !== $id));
        $this->saveItems('cms_announcements', $filtered);

        Response::success(null, 'Announcement deleted.');
    }

    // --- PAGES ---

    public function listPages(): void
    {
        $items = $this->getItems('cms_pages', self::DEFAULT_PAGES);
        Response::success($items, 'CMS pages retrieved.');
    }

    public function createPage(): void
    {
        $this->requireRoles(['super_admin', 'admin']);
        $body = $this->getJsonBody();

        $title = trim((string)($body['title'] ?? ''));
        $slug = strtolower(trim((string)($body['slug'] ?? '')));
        $metaDescription = trim((string)($body['metaDescription'] ?? ''));
        $published = (bool)($body['published'] ?? true);

        if (empty($title) || empty($slug)) {
            Response::error('Title and slug are required.', 400);
            return;
        }

        $items = $this->getItems('cms_pages', self::DEFAULT_PAGES);
        $newPage = [
            'id'              => 'page-' . bin2hex(random_bytes(6)),
            'title'           => $title,
            'slug'            => $slug,
            'metaDescription' => $metaDescription,
            'published'       => $published,
            'updatedAt'       => date('c'),
        ];
        array_unshift($items, $newPage);
        $this->saveItems('cms_pages', $items);

        Response::success($newPage, 'CMS Page created successfully.', 201);
    }

    public function updatePage(array $params): void
    {
        $this->requireRoles(['super_admin', 'admin']);
        $id = $params['id'] ?? '';
        $body = $this->getJsonBody();

        $items = $this->getItems('cms_pages', self::DEFAULT_PAGES);
        $updated = null;

        foreach ($items as &$item) {
            if ($item['id'] === $id) {
                if (isset($body['title'])) $item['title'] = trim((string)$body['title']);
                if (isset($body['slug'])) $item['slug'] = strtolower(trim((string)$body['slug']));
                if (isset($body['metaDescription'])) $item['metaDescription'] = trim((string)$body['metaDescription']);
                if (isset($body['published'])) $item['published'] = (bool)$body['published'];
                $item['updatedAt'] = date('c');
                $updated = $item;
                break;
            }
        }

        if (!$updated) {
            Response::notFound('Page not found.');
            return;
        }

        $this->saveItems('cms_pages', $items);
        Response::success($updated, 'Page updated successfully.');
    }

    public function deletePage(array $params): void
    {
        $this->requireRoles(['super_admin', 'admin']);
        $id = $params['id'] ?? '';

        $items = $this->getItems('cms_pages', self::DEFAULT_PAGES);
        $filtered = array_values(array_filter($items, fn($p) => $p['id'] !== $id));
        $this->saveItems('cms_pages', $filtered);

        Response::success(null, 'Page deleted.');
    }

    // --- BLOG POSTS ---

    public function listBlogPosts(): void
    {
        $items = $this->getItems('cms_posts', self::DEFAULT_POSTS);
        Response::success($items, 'Blog posts retrieved.');
    }

    public function createBlogPost(): void
    {
        $this->requireRoles(['super_admin', 'admin']);
        $body = $this->getJsonBody();

        $title = trim((string)($body['title'] ?? ''));
        $slug = strtolower(trim((string)($body['slug'] ?? '')));
        $summary = trim((string)($body['summary'] ?? ''));
        $category = trim((string)($body['category'] ?? 'General'));
        $author = trim((string)($body['author'] ?? 'Hambak Editorial Team'));
        $featured = (bool)($body['featured'] ?? false);

        if (empty($title) || empty($slug)) {
            Response::error('Title and slug are required.', 400);
            return;
        }

        $items = $this->getItems('cms_posts', self::DEFAULT_POSTS);
        $newPost = [
            'id'          => 'post-' . bin2hex(random_bytes(6)),
            'title'       => $title,
            'slug'        => $slug,
            'summary'     => $summary,
            'category'    => $category,
            'author'      => $author,
            'featured'    => $featured,
            'publishedAt' => date('c'),
        ];
        array_unshift($items, $newPost);
        $this->saveItems('cms_posts', $items);

        Response::success($newPost, 'Blog post created successfully.', 201);
    }

    public function updateBlogPost(array $params): void
    {
        $this->requireRoles(['super_admin', 'admin']);
        $id = $params['id'] ?? '';
        $body = $this->getJsonBody();

        $items = $this->getItems('cms_posts', self::DEFAULT_POSTS);
        $updated = null;

        foreach ($items as &$item) {
            if ($item['id'] === $id) {
                if (isset($body['title'])) $item['title'] = trim((string)$body['title']);
                if (isset($body['slug'])) $item['slug'] = strtolower(trim((string)$body['slug']));
                if (isset($body['summary'])) $item['summary'] = trim((string)$body['summary']);
                if (isset($body['category'])) $item['category'] = trim((string)$body['category']);
                if (isset($body['author'])) $item['author'] = trim((string)$body['author']);
                if (isset($body['featured'])) $item['featured'] = (bool)$body['featured'];
                $updated = $item;
                break;
            }
        }

        if (!$updated) {
            Response::notFound('Blog post not found.');
            return;
        }

        $this->saveItems('cms_posts', $items);
        Response::success($updated, 'Blog post updated successfully.');
    }

    public function deleteBlogPost(array $params): void
    {
        $this->requireRoles(['super_admin', 'admin']);
        $id = $params['id'] ?? '';

        $items = $this->getItems('cms_posts', self::DEFAULT_POSTS);
        $filtered = array_values(array_filter($items, fn($p) => $p['id'] !== $id));
        $this->saveItems('cms_posts', $filtered);

        Response::success(null, 'Blog post deleted.');
    }
}
