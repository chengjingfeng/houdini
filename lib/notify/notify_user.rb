# frozen_string_literal: true

# License: AGPL-3.0-or-later WITH WTO-AP-3.0-or-later
# Full license explanation at https://github.com/houdiniproject/houdini/blob/main/LICENSE
module NotifyUser
  def self.send_confirmation_email(user_id)
    ParamValidation.new({ user_id: user_id }, user_id: { required: true, is_integer: true })
    user = User.where('id = ?', user_id).first
    unless user
      raise ParamValidation::ValidationError.new("#{user_id} is not a valid user id", key: :user_id, val: user_id)
    end

    user.send_confirmation_instructions
  end
end
