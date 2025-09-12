# Page snapshot

```yaml
- generic [ref=e2]:
  - region "Notifications (F8)":
    - list
  - region "Notifications alt+T"
  - generic [ref=e4]:
    - generic [ref=e5]:
      - heading "Sign in to your account" [level=2] [ref=e6]
      - paragraph [ref=e7]:
        - text: Don't have an account?
        - button "Sign up" [ref=e8] [cursor=pointer]
    - generic [ref=e9]:
      - generic [ref=e10]:
        - generic [ref=e11]: Email
        - textbox "Email" [ref=e12]
      - generic [ref=e13]:
        - generic [ref=e14]: Password
        - textbox "Password" [ref=e15]
      - generic [ref=e16]:
        - checkbox "Remember me for 30 days" [ref=e17] [cursor=pointer]
        - checkbox
        - generic [ref=e18] [cursor=pointer]: Remember me for 30 days
      - generic [ref=e19]:
        - button "Sign in" [ref=e20] [cursor=pointer]
        - button "Forgot your password?" [ref=e22] [cursor=pointer]
```