<?php
/**
 * User Model
 */

require_once __DIR__ . '/../config/Database.php';

class User {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function findByEmail(string $email): ?array {
        $stmt = $this->db->prepare("SELECT * FROM users WHERE email = :email LIMIT 1");
        $stmt->execute(['email' => strtolower(trim($email))]);
        $user = $stmt->fetch();
        return $user ?: null;
    }

    public function findById(int $id): ?array {
        $stmt = $this->db->prepare("SELECT id, name, email, role, phone, avatar, created_at FROM users WHERE id = :id LIMIT 1");
        $stmt->execute(['id' => $id]);
        $user = $stmt->fetch();
        return $user ?: null;
    }

    public function authenticate(string $email, string $password): ?array {
        $user = $this->findByEmail($email);
        if ($user && password_verify($password, $user['password_hash'])) {
            // Remove password_hash before returning
            unset($user['password_hash']);
            return $user;
        }
        return null;
    }

    public function create(array $data): int {
        $stmt = $this->db->prepare("
            INSERT INTO users (name, email, password_hash, role, phone, avatar)
            VALUES (:name, :email, :password_hash, :role, :phone, :avatar)
        ");
        $stmt->execute([
            'name' => $data['name'],
            'email' => strtolower(trim($data['email'])),
            'password_hash' => password_hash($data['password'], PASSWORD_BCRYPT),
            'role' => $data['role'] ?? 'customer',
            'phone' => $data['phone'] ?? null,
            'avatar' => $data['avatar'] ?? 'default-avatar.webp'
        ]);
        return (int)$this->db->lastInsertId();
    }

    public function getAll(): array {
        $stmt = $this->db->query("SELECT id, name, email, role, phone, created_at FROM users ORDER BY id DESC");
        return $stmt->fetchAll();
    }

    public function updateRole(int $id, string $role): bool {
        $stmt = $this->db->prepare("UPDATE users SET role = :role WHERE id = :id");
        return $stmt->execute(['role' => $role, 'id' => $id]);
    }
}
