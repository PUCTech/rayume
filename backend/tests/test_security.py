from backend.security import hash_password, verify_password


def test_correct_password_verifies():
    assert verify_password("hunter2hunter2", hash_password("hunter2hunter2"))


def test_wrong_password_is_false():
    assert verify_password("wrong-password", hash_password("hunter2hunter2")) is False


def test_same_password_gives_different_hashes():
    a = hash_password("hunter2hunter2")
    b = hash_password("hunter2hunter2")
    assert a != b
    assert verify_password("hunter2hunter2", a)
    assert verify_password("hunter2hunter2", b)


def test_hash_is_argon2_and_hides_the_password():
    h = hash_password("hunter2hunter2")
    assert h.startswith("$argon2")
    assert "hunter2" not in h


def test_missing_or_garbage_hash_is_false():
    assert verify_password("anything", None) is False
    assert verify_password("anything", "") is False
    assert verify_password("anything", "not-a-hash") is False
