<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Site copy lives in Lovable Cloud tables (site_settings, outreaches, programs, partners) and is edited at /admin; never hardcode content in pages. Why: owner updates content without code.
- Editing rights come from public.user_roles (first signup auto-becomes admin via trigger). Why: roles must not live in user-editable data.
