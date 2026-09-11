from jarvis.tools.permission import PermissionLayer, looks_catastrophic


def test_allow_policy_skips_asker():
    calls = []
    layer = PermissionLayer(asker=lambda name, args: calls.append((name, args)) or "no")
    assert layer.check("read_file", {"path": "/tmp/x"}) is True
    assert calls == []


def test_deny_policy_skips_asker():
    layer = PermissionLayer(policy={"nuke": "deny"}, asker=lambda n, a: "yes")
    assert layer.check("nuke", {}) is False


def test_ask_policy_consults_asker():
    layer = PermissionLayer(asker=lambda n, a: "yes")
    assert layer.check("write_file", {"path": "/tmp/x"}) is True

    layer2 = PermissionLayer(asker=lambda n, a: "no")
    assert layer2.check("write_file", {"path": "/tmp/x"}) is False


def test_always_remembers_for_session():
    calls = []
    layer = PermissionLayer(asker=lambda n, a: calls.append(1) or "always")
    assert layer.check("run_shell", {"command": "ls"}) is True
    assert layer.check("run_shell", {"command": "pwd"}) is True
    assert len(calls) == 1  # only asked once


def test_catastrophic_shell_command_hard_blocked_even_if_asker_says_yes():
    layer = PermissionLayer(asker=lambda n, a: "always")
    assert layer.check("run_shell", {"command": "rm -rf /"}) is False


def test_looks_catastrophic_examples():
    assert looks_catastrophic("rm -rf /")
    assert looks_catastrophic("rm -rf ~")
    assert looks_catastrophic("mkfs.ext4 /dev/sda1")
    assert looks_catastrophic("dd if=/dev/zero of=/dev/sda")
    assert not looks_catastrophic("rm -rf ./build")
    assert not looks_catastrophic("ls -la")
